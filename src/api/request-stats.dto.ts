import { IsEnum, IsNotEmpty, IsNumber, IsObject, Max, Min } from 'class-validator';

export class RequestStatsDto {

  @IsNotEmpty()
  @IsEnum(['session', 'event'])
  type: string = 'session';

  @IsNumber({maxDecimalPlaces: 0})
  @Min(0)
  @Max(1000)
  limit: number = 10;

  @IsNumber({maxDecimalPlaces: 0})
  @Min(0)
  offset: number = 0;

  @IsObject()
  filters: {[key: string]: any} = {};

}
