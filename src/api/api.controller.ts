import { Controller, Post, Body } from '@nestjs/common';
import { ApiService } from './api.service';
import { CreateSessionDto } from './create-session.dto';
import { Session } from '../session/session.entity';
import { AddEventDto } from './add-event.dto';
import { Event } from '../event/event.entity';
import { RequestStatsDto } from './request-stats.dto';

@Controller('api')
export class ApiController {

  constructor(
    private readonly apiService: ApiService,
  ) {}

  @Post('session')
  async createSession(@Body() createSessionDto: CreateSessionDto) {
    const session: Session | null = await this.apiService.createSession(
      createSessionDto.product,
      createSessionDto.label ? createSessionDto.label : '',
      createSessionDto.version ? createSessionDto.version : '',
    );
    return session?.session_id;
  }

  @Post('event')
  async addEvent(@Body() addEventDto: AddEventDto) {
    const event: Event | null = await this.apiService.addEvent(
      addEventDto.sessionId,
      addEventDto.event,
      addEventDto.category,
      addEventDto.action ? addEventDto.action : '',
      addEventDto.label ? addEventDto.label : '',
    );
    return !!event ? 'ok' : 'er';
  }

  @Post('request-stats')
  async requestStats(@Body() requestStatsDto: RequestStatsDto) {
    return await this.apiService.requestStats(
      requestStatsDto.type,
      requestStatsDto.offset,
      requestStatsDto.limit,
      requestStatsDto.filters,
    );
  }

}
