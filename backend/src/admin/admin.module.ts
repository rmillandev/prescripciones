import { Module } from '@nestjs/common';
import { AuthModule } from 'src/auth/auth.module';
import { PrescripcionesModule } from 'src/prescripciones/prescripciones.module';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';

@Module({
  imports: [AuthModule, PrescripcionesModule],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}
