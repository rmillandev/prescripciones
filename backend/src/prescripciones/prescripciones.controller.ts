import { Controller, Get, Post, Body, Patch, Param, UseGuards, Req, Query } from '@nestjs/common';
import { PrescripcionesService } from './prescripciones.service';
import { CreatePrescripcioneDto } from './dto/create-prescripcione.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { RolesGuard } from 'src/auth/roles.guard';
import { Roles } from 'src/auth/roles.decorator';
import { Role } from 'src/auth/role.enum';
import { FilterPrescripcioneDto } from './dto/filter-prescripcione.dto';

@Controller('prescripciones')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PrescripcionesController {
  constructor(private readonly prescripcionesService: PrescripcionesService) {}

  @Post()
  @Roles(Role.Doctor, Role.Admin)
  async create(@Body() createPrescripcioneDto: CreatePrescripcioneDto, @Req() req: Request & { user: any}) { 
    return this.prescripcionesService.create(createPrescripcioneDto, req.user.id, req.user.role);
  }
  
  @Get("doctor")
  @Roles(Role.Doctor, Role.Admin)
  findAllByDoctor(@Req() req: Request & { user: any }, @Query() filters: FilterPrescripcioneDto) {
    return this.prescripcionesService.findAllByDoctor(req.user.id, filters, req.user.role);
  }

  @Get("doctor/:id")
  @Roles(Role.Doctor, Role.Admin)
  findOneByDoctor(@Param('id') id: string, @Req() req: Request & { user: any }) {
    return this.prescripcionesService.findOneByDoctor(id, req.user.id, req.user.role);
  }

  @Get('patient')
  @Roles(Role.Patient, Role.Admin)
  findAllPatient(@Req() req: Request & { user: any }, @Query() filters: FilterPrescripcioneDto) {
    return this.prescripcionesService.findAllByPatient(req.user.id, filters, req.user.role);
  }

  @Get('admin')
  @Roles(Role.Admin)
  findAllByAdmin(@Query() filters: FilterPrescripcioneDto) {
    return this.prescripcionesService.findAllByAdmin(filters);
  }

  @Get('patient/:id')
  @Roles(Role.Patient, Role.Admin)
  findOnePatient(@Param('id') id: string, @Req() req: Request & { user: any }) {
    return this.prescripcionesService.findOneByPatient(id, req.user.id, req.user.role);
  }

  @Patch('patient/consume/:id')
  @Roles(Role.Patient, Role.Admin)
  consumePrescriptionByPatient(@Param('id') id: string, @Req() req: Request & { user: any }) {
    return this.prescripcionesService.consumePrescriptionByPatient(id, req.user.id, req.user.role);
  }

}
