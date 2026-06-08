import { Module } from '@nestjs/common';
import { PrescripcionesService } from './prescripciones.service';
import { PrescripcionesController } from './prescripciones.controller';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [PrescripcionesController],
  providers: [PrescripcionesService],
})
export class PrescripcionesModule {}
