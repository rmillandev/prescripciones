import { Controller, Get, Post, Body, Req, UseGuards } from '@nestjs/common';
import type { Request } from 'express';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { JwtAuthGuard } from './jwt-auth.guard';
import { RolesGuard } from './roles.guard';
import { Roles } from './roles.decorator';
import { Role } from './role.enum';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  register(@Body() createUserDto: CreateUserDto) {
    return this.authService.register(createUserDto);
  }

  @Post('login')
  login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Post('refresh')
  refreshToken(@Req() request: Request) {
    const [type, token] = request.headers['authorization']?.split(' ') || [];
    return this.authService.refreshToken(type, token);
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  profile(@Req() request: any) {
    return request.user;
  }

  @Get('doctor-only')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Doctor, Role.Patient)
  doctorOnly(@Req() request: any) {
    return {
      message: 'Ruta protegida para doctor o admin',
      user: request.user,
    };
  }
}
