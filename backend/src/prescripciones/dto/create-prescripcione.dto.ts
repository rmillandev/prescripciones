import { IsArray, ArrayMinSize, IsDateString, IsEnum, IsNotEmpty, IsOptional, IsString, ValidateNested} from 'class-validator';
import { Type } from 'class-transformer';
import { CreatePrescriptionItemDto } from './create-prescription-item.dto';

export enum PrescriptionStatus {
  pending = 'pending',
  consumed = 'consumed',
}

export class CreatePrescripcioneDto {
  @IsOptional()
  @IsEnum(PrescriptionStatus)
  readonly status?: PrescriptionStatus;

  @IsOptional()
  @IsString()
  readonly notes?: string;

  @IsOptional()
  @IsDateString()
  readonly consumedAt?: string;

  @IsNotEmpty()
  @IsString()
  readonly patientId!: string;

  @IsOptional()
  @IsString()
  readonly doctorId?: string;

  @IsOptional()
  @ArrayMinSize(1)
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreatePrescriptionItemDto)
  readonly items?: CreatePrescriptionItemDto[];
}

