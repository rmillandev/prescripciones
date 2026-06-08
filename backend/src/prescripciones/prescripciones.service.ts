import { HttpStatus, Injectable, NotFoundException, InternalServerErrorException, BadRequestException } from '@nestjs/common';
import { CreatePrescripcioneDto } from './dto/create-prescripcione.dto';
import { UpdatePrescripcioneDto } from './dto/update-prescripcione.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { PrescriptionStatus } from './dto/create-prescripcione.dto';

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

  async findOneByDoctor(id: string, userId: string) {
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

  async findAllByPatient(userId: string) {
    const patient = await this.prisma.patient.findUnique({
      where: {
        userId,
      },
    });

    if (!patient) throw new NotFoundException('Patient not found');

    return this.prisma.prescription.findMany({
      where: {
        patientId: patient.id,
      },
      include: {
        author: {
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

  async findOneByPatient(prescriptionId: string, userId: string) {
    const patient = await this.prisma.patient.findUnique({
      where: {
        userId,
      },
    });

    if (!patient) throw new NotFoundException('Patient not found');

    const prescription = await this.prisma.prescription.findFirst({
      where: {
        id: prescriptionId,
        patientId: patient.id,
      },
      include: {
        items: true,
        author: {
          include: {
            user: false,
          },
        },
        patient: {
          include: {
            user: false,
          },
        },
      },
    });

    if (!prescription) throw new NotFoundException('Prescription not found');

    return prescription;
  }

  async consumePrescriptionByPatient(prescriptionId: string, userId: string) {
    const patient = await this.prisma.patient.findUnique({
      where: {
        userId,
      },
    });

    if (!patient) throw new NotFoundException('Patient not found');

    const prescriptionFind = await this.prisma.prescription.findFirst({
      where: {
        id: prescriptionId,
        patientId: patient.id,
      },
    });

    if (!prescriptionFind) throw new NotFoundException('Prescription not found');

    if (prescriptionFind.status === PrescriptionStatus.consumed) throw new BadRequestException('Prescription already consumed');

    const prescriptionUpdate = await this.prisma.prescription.update({
      where: {
        id: prescriptionId,
      },
      data: {
        status: PrescriptionStatus.consumed,
        consumedAt: new Date(),
      },
    });

    return {
      message: 'Prescription status updated successfully',
      status: HttpStatus.OK,
      data: {
        prescriptionId: prescriptionUpdate.id,
        status: prescriptionUpdate.status,
        consumedAt: prescriptionUpdate.consumedAt
      },
    };
  }

}
