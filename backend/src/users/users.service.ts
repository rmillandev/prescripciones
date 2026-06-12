import { BadRequestException, HttpException, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { FilterUserDto } from './dto/filter-user.dto';

@Injectable()
export class UsersService {

  constructor(private prisma: PrismaService) {}

  async findAll(filters: FilterUserDto) {

    const { page = 1, limit = 10, role } = filters;

    const skip = (page - 1) * limit;

    const where = {
      ...(role && {
        role,
      }),
    };

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          createdAt: true,
        },
        skip,
        take: limit,
        orderBy: {
          createdAt: 'desc',
        },
      }),

      this.prisma.user.count({
        where,
      }),
    ]);

    return {
      data: users,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

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
