import { Injectable } from '@nestjs/common';
import { SessionService } from '../session/session.service';
import { EventService } from '../event/event.service';

@Injectable()
export class ApiService {

  constructor(
    private readonly sessionService: SessionService,
    private readonly eventService: EventService,
  ) {}

  public createSession(product: string, label: string = '', version: string = '') {
    return this.sessionService.createSession(product, label, version);
  }

  public addEvent(sessionId: string, event: string, category: string = '', action: string = '', label: string = '') {
    return this.eventService.addEvent(sessionId, event, category, action, label);
  }

  public requestStats(type: string, offset: number, limit: number, filters?: {[key: string]: any}) {
    if (type === 'session') {
      return this.sessionService.request(offset, limit, filters || {});
    }
    if (type === 'event') {
      return this.eventService.request(offset, limit, filters || {});
    }
  }

}
