import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateDoctorDto } from './dto/create-doctor.dto';
import { UpdateDoctorDto } from './dto/update-doctor.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class DoctorService {

  constructor(private readonly prisma: PrismaService) {}

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
