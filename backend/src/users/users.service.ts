import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { FilterUserDto } from './dto/filter-user.dto';

@Injectable()
export class UsersService {

  constructor(private prisma: PrismaService) {}

  async findAll(filters: FilterUserDto) {

    const { page = 1, limit = 10, role, query } = filters;

    const skip = (page - 1) * limit;

    const where = {
      ...(role && {
        role,
      }),
      ...(query && {
        OR: [
          {
            name: {
              contains: query,
              mode: 'insensitive' as const,
            },
          },
          {
            email: {
              contains: query,
              mode: 'insensitive' as const,
            },
          },
        ],
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

  async update(id: string, updateUserDto: UpdateUserDto) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('User not found');

    if (updateUserDto.email) {
      const emailExists = await this.prisma.user.findFirst({
        where: { email: updateUserDto.email, NOT: { id } },
      });
      if (emailExists) throw new ConflictException('Email already in use');
    }

    const data: Record<string, unknown> = { ...updateUserDto };
    if (data.password) {
      data.password = await bcrypt.hash(data.password as string, 10);
    }

    return this.prisma.user.update({
      where: { id },
      data,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });
  }

  async remove(id: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('User not found');

    const doctor = await this.prisma.doctor.findUnique({ where: { userId: id } });
    if (doctor) {
      const prescriptions = await this.prisma.prescription.findMany({
        where: { authorId: doctor.id },
        select: { id: true },
      });
      await this.prisma.prescriptionItem.deleteMany({
        where: { prescriptionId: { in: prescriptions.map((p) => p.id) } },
      });
      await this.prisma.prescription.deleteMany({ where: { authorId: doctor.id } });
      await this.prisma.doctor.delete({ where: { userId: id } });
    }

    const patient = await this.prisma.patient.findUnique({ where: { userId: id } });
    if (patient) {
      const prescriptions = await this.prisma.prescription.findMany({
        where: { patientId: patient.id },
        select: { id: true },
      });
      await this.prisma.prescriptionItem.deleteMany({
        where: { prescriptionId: { in: prescriptions.map((p) => p.id) } },
      });
      await this.prisma.prescription.deleteMany({ where: { patientId: patient.id } });
      await this.prisma.patient.delete({ where: { userId: id } });
    }

    await this.prisma.user.delete({ where: { id } });

    return { message: 'User deleted successfully' };
  }
}
