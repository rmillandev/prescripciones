import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateDoctorDto {
  @IsNotEmpty()
  @IsString()
  readonly userId!: string;

  @IsOptional()
  @IsString()
  readonly specialty?: string;
}
