import { PartialType } from '@nestjs/mapped-types';
import { CreatePrescripcioneDto } from './create-prescripcione.dto';

export class UpdatePrescripcioneDto extends PartialType(CreatePrescripcioneDto) {}
