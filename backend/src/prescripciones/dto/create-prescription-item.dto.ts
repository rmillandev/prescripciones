import { IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreatePrescriptionItemDto {
  @IsNotEmpty()
  @IsString()
  readonly name!: string;

  @IsOptional()
  @IsString()
  readonly dosage?: string;

  @IsOptional()
  @IsInt()
  readonly quantity?: number;

  @IsOptional()
  @IsString()
  readonly instructions?: string;
}
