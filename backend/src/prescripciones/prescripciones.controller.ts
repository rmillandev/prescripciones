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
  
}
