import { IsNotEmpty, IsArray } from 'class-validator';

export class AddEventDto {

  @IsNotEmpty()
  sessionId: string = '';

  @IsNotEmpty()
  event: string = '';

  category: string = '';

  action?: string = '';

  label?: string = '';

}
