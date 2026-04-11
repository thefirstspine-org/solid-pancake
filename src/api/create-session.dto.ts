import { IsNotEmpty, IsArray } from 'class-validator';

export class CreateSessionDto {

  @IsNotEmpty()
  product: string = '';

  label?: string = '';

  version?: string = '';
}
