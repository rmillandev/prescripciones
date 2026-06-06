import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { PrescripcionesService } from './prescripciones.service';
import { CreatePrescripcioneDto } from './dto/create-prescripcione.dto';
import { UpdatePrescripcioneDto } from './dto/update-prescripcione.dto';

@Controller('prescripciones')
export class PrescripcionesController {
  constructor(private readonly prescripcionesService: PrescripcionesService) {}

  @Post()
  create(@Body() createPrescripcioneDto: CreatePrescripcioneDto) {
    return this.prescripcionesService.create(createPrescripcioneDto);
  }

  @Get()
  findAll() {
    return this.prescripcionesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.prescripcionesService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePrescripcioneDto: UpdatePrescripcioneDto) {
    return this.prescripcionesService.update(+id, updatePrescripcioneDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.prescripcionesService.remove(+id);
  }
}
