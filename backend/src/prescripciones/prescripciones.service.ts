import { Injectable } from '@nestjs/common';
import { CreatePrescripcioneDto } from './dto/create-prescripcione.dto';
import { UpdatePrescripcioneDto } from './dto/update-prescripcione.dto';

@Injectable()
export class PrescripcionesService {
  create(createPrescripcioneDto: CreatePrescripcioneDto) {
    return 'This action adds a new prescripcione';
  }

  findAll() {
    return `This action returns all prescripciones`;
  }

  findOne(id: number) {
    return `This action returns a #${id} prescripcione`;
  }

  update(id: number, updatePrescripcioneDto: UpdatePrescripcioneDto) {
    return `This action updates a #${id} prescripcione`;
  }

  remove(id: number) {
    return `This action removes a #${id} prescripcione`;
  }
}
