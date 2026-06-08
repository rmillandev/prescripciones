import { IsNotEmpty, IsOptional, IsString, IsDateString } from 'class-validator';

export class CreatePatientDto {
  @IsNotEmpty()
  @IsString()
  readonly userId!: string;

  @IsOptional()
  @IsDateString()
  readonly birthDate?: string;
}
