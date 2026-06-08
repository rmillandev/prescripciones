import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { PrescripcionesService } from './prescripciones.service';
import { CreatePrescripcioneDto } from './dto/create-prescripcione.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { RolesGuard } from 'src/auth/roles.guard';
import { Roles } from 'src/auth/roles.decorator';
import { Role } from 'src/auth/role.enum';

@Controller('prescripciones')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PrescripcionesController {
  constructor(private readonly prescripcionesService: PrescripcionesService) {}

  @Post()
  @Roles(Role.Doctor)
  async create(@Body() createPrescripcioneDto: CreatePrescripcioneDto, @Req() req: Request & { user: any}) { 
    return this.prescripcionesService.create(createPrescripcioneDto, req.user.id);
  }
  
  @Get("doctor")
  @Roles(Role.Doctor)
  findAllByDoctor(@Req() req: Request & { user: any }) {
    return this.prescripcionesService.findAllByDoctor(req.user.id);
  }

  @Get("doctor/:id")
  @Roles(Role.Doctor)
  findOneByDoctor(@Param('id') id: string, @Req() req: Request & { user: any }) {
    return this.prescripcionesService.findOneByDoctor(id, req.user.id);
  }

  @Get('patient')
  @Roles(Role.Patient)
  findAllPatient(@Req() req: Request & { user: any }) {
    return this.prescripcionesService.findAllByPatient(req.user.id);
  }

  @Get('patient/:id')
  @Roles(Role.Patient)
  findOnePatient(@Param('id') id: string, @Req() req: Request & { user: any }) {
    return this.prescripcionesService.findOneByPatient(id, req.user.id);
  }

  @Patch('patient/consume/:id')
  @Roles(Role.Patient)
  consumePrescriptionByPatient(@Param('id') id: string, @Req() req: Request & { user: any }) {
    return this.prescripcionesService.consumePrescriptionByPatient(id, req.user.id);
  }

}
