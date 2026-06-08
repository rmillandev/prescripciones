import { HttpStatus, Injectable, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { CreatePrescripcioneDto } from './dto/create-prescripcione.dto';
import { UpdatePrescripcioneDto } from './dto/update-prescripcione.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class PrescripcionesService {

  constructor(private prisma: PrismaService) {}

  async create(prescripcionDto: CreatePrescripcioneDto, doctorId: string) {
    try {
      const patient = await this.prisma.patient.findUnique({
        where: {
          id: prescripcionDto.patientId,
        },
      });

      if (!patient) throw new NotFoundException('Patient not found');
      
      const doctor = await this.prisma.doctor.findUnique({
        where: {
          userId: doctorId
        }
      });

      if (!doctor) throw new NotFoundException('Doctor not found');

      const code = `RX-${Date.now()}`;

      const prescription = await this.prisma.prescription.create({
        data: {
          code: code,
          notes: prescripcionDto.notes,
          status: prescripcionDto.status,
          patientId: prescripcionDto.patientId,
          authorId: doctor.id,
          items: {
            create: prescripcionDto.items?.map(item => ({
              name: item.name,
              dosage: item.dosage,
              quantity: item.quantity,
              instructions: item.instructions
            }))
          }
        },
        include: { 
          items: true,
          patient: true,
          author: true
        }
      });

      return {
        prescription,
        message: 'Prescription created successfully',
        status: HttpStatus.CREATED
      };
    } catch (err) { 
      throw new InternalServerErrorException(`Failed to create prescription: ${err}`);
    }
  }

  async findAllByDoctor(userId: string) {
    const doctor = await this.prisma.doctor.findUnique({
      where: {
        userId,
      },
    });

    if (!doctor) throw new NotFoundException('Doctor not found');

    return this.prisma.prescription.findMany({
      where: {
        authorId: doctor.id,
      },
      include: {
        patient: {
          include: {
            user: false,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(id: string, userId: string) {
    const doctor = await this.prisma.doctor.findUnique({
      where: {
        userId,
      },
    });

    if (!doctor) throw new NotFoundException('Doctor not found');

    const prescription = await this.prisma.prescription.findFirst({
      where: {
        id,
        authorId: doctor.id,
      },
      include: {
        items: true,
        patient: {
          include: {
            user: false,
          },
        },
        author: {
          include: {
            user: false,
          },
        },
      },
    });

    if (!prescription) throw new NotFoundException('Prescription not found');

    return prescription;
  }

}
