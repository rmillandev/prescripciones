import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateDoctorDto } from './dto/create-doctor.dto';
import { UpdateDoctorDto } from './dto/update-doctor.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { FilterDoctorDto } from './dto/filter-doctor.dto';

@Injectable()
export class DoctorService {

  constructor(private readonly prisma: PrismaService) {}

  async findAll(filters: FilterDoctorDto) {
    const { page = 1, limit = 10, query, specialty } = filters;

    const skip = (page - 1) * limit;

    const where = {
      ...(specialty && {
        specialty: {
          contains: specialty,
          mode: 'insensitive' as const,
        },
      }),
      ...(query && {
        OR: [
          {
            specialty: {
              contains: query,
              mode: 'insensitive' as const,
            },
          },
          {
            user: {
              name: {
                contains: query,
                mode: 'insensitive' as const,
              },
            },
          },
          {
            user: {
              email: {
                contains: query,
                mode: 'insensitive' as const,
              },
            },
          },
        ],
      }),
    };

    const [doctors, total] = await Promise.all([
      this.prisma.doctor.findMany({
        where,
        select: {
          id: true,
          specialty: true,
          userId: true,
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
              createdAt: true,
            },
          },
        },
        skip,
        take: limit,
        orderBy: {
          user: {
            createdAt: 'desc',
          },
        },
      }),
      this.prisma.doctor.count({
        where,
      }),
    ]);

    return {
      data: doctors,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async create(dto: CreateDoctorDto) { 
     const user = await this.prisma.user.findUnique({
      where: {
        id: dto.userId,
      },
    });

    if (!user) throw new NotFoundException('User not found');

    const doctorExists = await this.prisma.doctor.findUnique({
      where: {
        userId: dto.userId,
      },
    });

    if (doctorExists) throw new ConflictException('This user already has a doctor profile');

    if (user.role !== 'doctor') throw new ConflictException('User role must be doctor');

    return this.prisma.doctor.create({
      data: {
        userId: dto.userId,
        specialty: dto.specialty,
      },
      include: {
        user: true,
      },
    });
  }

}
