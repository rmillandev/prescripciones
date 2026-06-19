import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { CreatePatientDto } from './dto/create-patient.dto';
import { UpdatePatientDto } from './dto/update-patient.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { FilterPatientDto } from './dto/filter-patient.dto';

@Injectable()
export class PatientService {

  constructor(private readonly prisma: PrismaService) {}

  async findAll(filters: FilterPatientDto) {
    const { page = 1, limit = 10, query } = filters;

    const skip = (page - 1) * limit;

    const where = {
      ...(query && {
        OR: [
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

    const [patients, total] = await Promise.all([
      this.prisma.patient.findMany({
        where,
        select: {
          id: true,
          birthDate: true,
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
      this.prisma.patient.count({
        where,
      }),
    ]);

    return {
      data: patients,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async create(dto: CreatePatientDto) {
    const user = await this.prisma.user.findUnique({
      where: {
        id: dto.userId,
      },
    });

    if (!user) throw new NotFoundException('User not found');

    const patientExists = await this.prisma.patient.findUnique({
      where: {
        userId: dto.userId,
      },
    });

    if (patientExists) throw new ConflictException('This user already has a patient profile');

    if (user.role !== 'patient') throw new ConflictException('User role must be patient');

    return this.prisma.patient.create({
      data: {
        userId: dto.userId,
        birthDate: dto.birthDate
          ? new Date(dto.birthDate)
          : undefined,
      },
      include: {
        user: true,
      },
    });
  }

}
