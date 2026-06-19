import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { PrescriptionStatus } from 'src/prescripciones/dto/create-prescripcione.dto';
import { MetricsFilterDto } from './dto/metrics-filter.dto';

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  async getMetrics(filters: MetricsFilterDto) {
    const { from, to } = filters;

    const prescriptionWhere = {
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

    const [
      doctors,
      patients,
      prescriptions,
      byStatus,
      prescriptionsByDay,
      topDoctors,
    ] = await Promise.all([
      this.prisma.doctor.count(),
      this.prisma.patient.count(),
      this.prisma.prescription.count({
        where: prescriptionWhere,
      }),
      this.prisma.prescription.groupBy({
        by: ['status'],
        where: prescriptionWhere,
        _count: {
          status: true,
        },
      }),
      this.prisma.prescription.findMany({
        where: prescriptionWhere,
        select: {
          createdAt: true,
        },
      }),
      this.prisma.prescription.groupBy({
        by: ['authorId'],
        where: prescriptionWhere,
        _count: {
          authorId: true,
        },
        orderBy: {
          _count: {
            authorId: 'desc',
          },
        },
        take: 5,
      }),
    ]);

    const byDay = Object.values(
      prescriptionsByDay.reduce<Record<string, { date: string; count: number }>>((acc, prescription) => {
        const date = prescription.createdAt.toISOString().slice(0, 10);

        acc[date] = acc[date] ?? {
          date,
          count: 0,
        };
        acc[date].count += 1;

        return acc;
      }, {}),
    ).sort((a, b) => a.date.localeCompare(b.date));

    return {
      totals: {
        doctors,
        patients,
        prescriptions,
      },
      byStatus: {
        pending:
          byStatus.find((item) => item.status === PrescriptionStatus.pending)?._count.status ?? 0,
        consumed:
          byStatus.find((item) => item.status === PrescriptionStatus.consumed)?._count.status ?? 0,
      },
      byDay,
      topDoctors: topDoctors.map((doctor) => ({
        doctorId: doctor.authorId,
        count: doctor._count.authorId,
      })),
    };
  }
}
