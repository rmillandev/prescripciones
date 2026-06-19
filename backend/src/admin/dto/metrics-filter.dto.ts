import { IsDateString, IsOptional } from 'class-validator';

export class MetricsFilterDto {
  @IsOptional()
  @IsDateString()
  from?: string;

  @IsOptional()
  @IsDateString()
  to?: string;
}
