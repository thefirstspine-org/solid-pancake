import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Event } from './event.entity';
import { Repository } from 'typeorm';
import { LogsService } from '@thefirstspine/logs-nest';

@Injectable()
export class EventService implements OnModuleDestroy {

  // In-memory buffer
  private buffer: Event[] = [];
  private readonly bufferLimit = 100;
  private readonly flushIntervalMs = 5000; // check every 5 seconds
  private readonly maxBufferAgeMs = 60 * 1000; // 1 minute
  private flushing = false;
  private intervalRef?: NodeJS.Timeout;

  constructor(
    private readonly logsService: LogsService,
    @InjectRepository(Event)
    private readonly eventRepository: Repository<Event>,
  ) {
    // Periodically check whether buffered events should be flushed
    this.intervalRef = setInterval(() => {
      // fire and forget
      void this.maybeFlush();
    }, this.flushIntervalMs);
  }

  async onModuleDestroy() {
    // Flush remaining events before shutdown
    if (this.intervalRef) {
      clearInterval(this.intervalRef);
    }
    await this.flush();
  }

  /**
   * Enqueue an event in memory. Flushes when buffer limit reached or when events get old.
   */
  async addEvent(sessionId: string, eventType: string, category: string = '', action: string = '', label: string = ''): Promise<Event|null> {
    try {
      const event: Event = new Event();
      event.session_id = sessionId;
      event.event = eventType;
      event.category = category;
      event.action = action;
      event.label = label;
      event.created_at = new Date();

      // Push to buffer
      this.buffer.push(event);

      // If buffer reached limit, trigger immediate flush (do not await)
      if (this.buffer.length >= this.bufferLimit) {
        void this.flush();
      }

      // Return the buffered event (truthy) so controller responds 'ok' immediately
      return event;
    } catch (error: any) {
      this.logsService.error(error.message, {
        message: error.message,
        name: error.name,
        stack: error.stack,
      });
      return null;
    }
  }

  /**
   * Check whether buffer should be flushed and flush if needed.
   */
  private async maybeFlush() {
    try {
      if (this.flushing) return;
      if (this.buffer.length === 0) return;

      // Flush if reached limit
      if (this.buffer.length >= this.bufferLimit) {
        await this.flush();
        return;
      }

      // Flush if oldest event is older than maxBufferAgeMs
      const oldest = this.buffer[0];
      if (!oldest) return;
      const age = Date.now() - (oldest.created_at ? oldest.created_at.getTime() : Date.now());
      if (age >= this.maxBufferAgeMs) {
        await this.flush();
      }
    } catch (error: any) {
      this.logsService.error('maybeFlush error', {error: error?.message ?? error});
    }
  }

  /**
   * Persist buffered events to the database in batch.
   */
  private async flush() {
    if (this.flushing) return;
    if (this.buffer.length === 0) return;

    this.flushing = true;
    // Take snapshot and clear buffer to allow new events while flushing
    const toFlush = this.buffer.splice(0, this.buffer.length);
    try {
      // Use save to ensure entity listeners (if any) run and created_at is preserved
      await this.eventRepository.save(toFlush);
    } catch (error: any) {
      // Log and re-queue events so they aren't lost
      this.logsService.error('Failed to flush events', {message: error?.message ?? error});
    } finally {
      this.flushing = false;
    }
  }

  async request(offset: number, limit: number, filters: {[key: string]: any}) {
    return await this.eventRepository.find({
      where: filters,
      take: limit,
      skip: offset,
      order: {
        created_at: 'DESC',
      },
    });
  }

}
