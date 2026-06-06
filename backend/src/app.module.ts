import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { PrescripcionesModule } from './prescripciones/prescripciones.module';

@Module({
  imports: [UsersModule, PrismaModule, AuthModule, PrescripcionesModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
