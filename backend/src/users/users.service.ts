import { BadRequestException, HttpException, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {

  constructor(private prisma: PrismaService) {}

  async create(createUserDto: CreateUserDto) {
    
    const emailExists = await this.prisma.user.findUnique({
      where: {
        email: createUserDto.email
      }
    });

    if (emailExists) throw new BadRequestException('This email already exists'); 

    if (createUserDto.password.length < 6) throw new BadRequestException('Password must be at least 6 characters long');

    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

     return this.prisma.user.create({
      data: {
        ...createUserDto,
        password: hashedPassword,
      },
    });
  }


}
