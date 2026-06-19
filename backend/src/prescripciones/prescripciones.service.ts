import { HttpException, HttpStatus, Injectable, NotFoundException, InternalServerErrorException, BadRequestException } from '@nestjs/common';
import { CreatePrescripcioneDto } from './dto/create-prescripcione.dto';
import { UpdatePrescripcioneDto } from './dto/update-prescripcione.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { PrescriptionStatus } from './dto/create-prescripcione.dto';
import { FilterPrescripcioneDto, OrderDirection } from './dto/filter-prescripcione.dto';
import { Role } from 'src/auth/role.enum';

@Injectable()
export class PrescripcionesService {

  constructor(private prisma: PrismaService) {}

  async create(prescripcionDto: CreatePrescripcioneDto, doctorUserId: string, role: Role) {
    try {
      const patient = await this.prisma.patient.findUnique({
        where: {
          id: prescripcionDto.patientId,
        },
      });

      if (!patient) throw new NotFoundException('Patient not found');
      
      if (role === Role.Admin && !prescripcionDto.doctorId) throw new BadRequestException('doctorId is required');

      const doctor = role === Role.Admin
        ? await this.prisma.doctor.findUnique({
            where: {
              id: prescripcionDto.doctorId,
            },
          })
        : await this.prisma.doctor.findUnique({
            where: {
              userId: doctorUserId,
            },
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
      if (err instanceof HttpException) throw err;

      throw new InternalServerErrorException(`Failed to create prescription: ${err}`);
    }
  }

  async findAllByDoctor(userId: string, filters: FilterPrescripcioneDto, role: Role) {
    if (role === Role.Admin) return this.findAllByAdmin(filters);

    const { page = 1, limit = 10, status, from, to, order = OrderDirection.desc } = filters;
    const skip = (page - 1) * limit;

    const doctor = await this.prisma.doctor.findUnique({
      where: {
        userId,
      },
    });

    if (!doctor) throw new NotFoundException('Doctor not found');

    const where = {
      authorId: doctor.id,
      ...(status && {
        status,
      }),
      ...((from || to) && {
        createdAt: {
          ...(from && {
            gte: new Date(from),
          }),
          ...(to && {
            lte: new Date(to),
          }),
        },
      }),
    };

    const [prescriptions, total] = await Promise.all([
      this.prisma.prescription.findMany({
        where,
        include: {
          patient: {
            include: {
              user: false,
            },
          },
        },
        skip,
        take: limit,
        orderBy: {
          createdAt: order,
        },
      }),
      this.prisma.prescription.count({
        where,
      }),
    ]);

    return {
      data: prescriptions,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOneByDoctor(id: string, userId: string, role: Role) {
    if (role === Role.Admin) return this.findOneByAdmin(id);

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

  async findOneByAdmin(id: string) {
    const prescription = await this.prisma.prescription.findUnique({
      where: {
        id,
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

  async findAllByPatient(userId: string, filters: FilterPrescripcioneDto, role: Role) {
    if (role === Role.Admin) return this.findAllByAdmin(filters);

    const { page = 1, limit = 10, status, from, to, order = OrderDirection.desc } = filters;
    const skip = (page - 1) * limit;

    const patient = await this.prisma.patient.findUnique({
      where: {
        userId,
      },
    });

    if (!patient) throw new NotFoundException('Patient not found');

    const where = {
      patientId: patient.id,
      ...(status && {
        status,
      }),
      ...((from || to) && {
        createdAt: {
          ...(from && {
            gte: new Date(from),
          }),
          ...(to && {
            lte: new Date(to),
          }),
        },
      }),
    };

    const [prescriptions, total] = await Promise.all([
      this.prisma.prescription.findMany({
        where,
        include: {
          author: {
            include: {
              user: false,
            },
          },
        },
        skip,
        take: limit,
        orderBy: {
          createdAt: order,
        },
      }),
      this.prisma.prescription.count({
        where,
      }),
    ]);

    return {
      data: prescriptions,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findAllByAdmin(filters: FilterPrescripcioneDto) {
    const {
      page = 1,
      limit = 10,
      status,
      doctorId,
      patientId,
      from,
      to,
      order = OrderDirection.desc,
    } = filters;

    const skip = (page - 1) * limit;

    const where = {
      ...(status && {
        status,
      }),
      ...(doctorId && {
        authorId: doctorId,
      }),
      ...(patientId && {
        patientId,
      }),
      ...((from || to) && {
        createdAt: {
          ...(from && {
            gte: new Date(from),
          }),
          ...(to && {
            lte: new Date(to),
          }),
        },
      }),
    };

    const [prescriptions, total] = await Promise.all([
      this.prisma.prescription.findMany({
        where,
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
        skip,
        take: limit,
        orderBy: {
          createdAt: order,
        },
      }),
      this.prisma.prescription.count({
        where,
      }),
    ]);

    return {
      data: prescriptions,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOneByPatient(prescriptionId: string, userId: string, role: Role) {
    if (role === Role.Admin) return this.findOneByAdmin(prescriptionId);

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

  async consumePrescriptionByPatient(prescriptionId: string, userId: string, role: Role) {
    if (role === Role.Admin) return this.consumePrescriptionByAdmin(prescriptionId);

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

  async consumePrescriptionByAdmin(prescriptionId: string) {
    const prescriptionFind = await this.prisma.prescription.findUnique({
      where: {
        id: prescriptionId,
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
