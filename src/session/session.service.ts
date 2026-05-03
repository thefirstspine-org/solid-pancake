import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Session } from './session.entity';
import { Repository } from 'typeorm';
import uniqid = require('uniqid');
import { LogsService } from '@thefirstspine/logs-nest';

@Injectable()
export class SessionService {

  constructor(
    private readonly logsService: LogsService,
    @InjectRepository(Session)
    private readonly sessionRepository: Repository<Session>,
  ) {}

  async createSession(product: string, label: string = '', version: string = ''): Promise<Session|null> {
    try {
      // Create ID
      const sessionId: string = uniqid();

      // Create session
      const session: Session = new Session();
      session.product = product;
      session.label = label;
      session.version = version;
      session.session_id = sessionId;

      // Insert
      await this.sessionRepository.insert(session);

      // Return the entity
      return this.sessionRepository.findOne({where: {session_id: sessionId}});
    } catch (error: any) {
      // Log error before returning something
      this.logsService.error(error.message, {
        message: error.message,
        name: error.name,
        stack: error.stack,
      });
      return null;
    }
  }

  async request(offset: number, limit: number, filters: {[key: string]: any}) {
    return await this.sessionRepository.find({
      where: filters,
      take: limit,
      skip: offset,
      relations: ['events'],
      order: {
        created_at: 'DESC',
      },
    });
  }

}
