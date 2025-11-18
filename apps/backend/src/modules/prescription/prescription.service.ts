import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { UpsertAppointmentPrescriptionDto } from './dto/upsert-appointment-prescription.dto';

@Injectable()
export class PrescriptionService {
  constructor(private prisma: PrismaService) {}

  async getByAppointment(tenantId: string, appointmentId: string) {
    const prescription = await this.prisma.prescription.findFirst({
      where: {
        tenantId,
        appointmentId,
      },
      include: {
        items: {
          include: {
            medicine: true,
          },
        },
        doctor: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                phone: true,
              },
            },
          },
        },
        appointment: {
          include: {
            patient: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                patientId: true,
                phone: true,
                email: true,
                dateOfBirth: true,
                gender: true,
                address: true,
              },
            },
            doctor: {
              include: {
                user: {
                  select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    email: true,
                    phone: true,
                  },
                },
                department: true,
              },
            },
          },
        },
      },
    });

    if (!prescription) {
      throw new NotFoundException('Prescription not found for this appointment');
    }

    return prescription;
  }

  async upsertForAppointment(
    tenantId: string,
    appointmentId: string,
    dto: UpsertAppointmentPrescriptionDto,
  ) {
    const appointment = await this.prisma.appointment.findFirst({
      where: {
        id: appointmentId,
        tenantId,
      },
    });

    if (!appointment) {
      throw new NotFoundException('Appointment not found');
    }

    const doctorId = appointment.doctorId;
    const prescriptionDate = dto.prescriptionDate
      ? new Date(dto.prescriptionDate)
      : new Date();

    const existing = await this.prisma.prescription.findFirst({
      where: {
        tenantId,
        appointmentId,
      },
    });

    if (existing) {
      await this.prisma.prescriptionItem.deleteMany({
        where: { prescriptionId: existing.id },
      });

      return this.prisma.prescription.update({
        where: { id: existing.id },
        data: {
          prescriptionDate,
          status: (dto.status as any) || existing.status,
          notes: dto.notes ?? existing.notes,
          items: {
            create: dto.items.map((item) => ({
              medicineId: item.medicineId,
              dosage: item.dosage,
              frequency: item.frequency,
              duration: item.duration,
              instructions: item.instructions,
              quantity: item.quantity,
            })),
          },
        },
        include: {
          items: {
            include: {
              medicine: true,
            },
          },
        },
      });
    }

    return this.prisma.prescription.create({
      data: {
        tenantId,
        appointmentId,
        doctorId,
        prescriptionDate,
        status: (dto.status as any) || 'PENDING',
        notes: dto.notes,
        items: {
          create: dto.items.map((item) => ({
            medicineId: item.medicineId,
            dosage: item.dosage,
            frequency: item.frequency,
            duration: item.duration,
            instructions: item.instructions,
            quantity: item.quantity,
          })),
        },
      },
      include: {
        items: {
          include: {
            medicine: true,
          },
        },
      },
    });
  }

  async listByPatient(tenantId: string, patientId: string) {
    return this.prisma.prescription.findMany({
      where: {
        tenantId,
        OR: [
          { appointment: { patientId } },
          { opdVisit: { patientId } },
          { ipdAdmission: { patientId } },
        ],
      },
      orderBy: {
        prescriptionDate: 'desc',
      },
      include: {
        items: {
          include: {
            medicine: true,
          },
        },
        appointment: {
          include: {
            doctor: {
              include: {
                user: {
                  select: {
                    firstName: true,
                    lastName: true,
                  },
                },
                department: true,
              },
            },
          },
        },
        opdVisit: {
          include: {
            doctor: {
              include: {
                user: {
                  select: {
                    firstName: true,
                    lastName: true,
                  },
                },
                department: true,
              },
            },
          },
        },
        ipdAdmission: {
          include: {
            doctor: {
              include: {
                user: {
                  select: {
                    firstName: true,
                    lastName: true,
                  },
                },
                department: true,
              },
            },
          },
        },
      },
    });
  }

  async findOne(tenantId: string, id: string) {
    const prescription = await this.prisma.prescription.findFirst({
      where: {
        id,
        tenantId,
      },
      include: {
        items: {
          include: {
            medicine: true,
          },
        },
        appointment: true,
        opdVisit: true,
        ipdAdmission: true,
      },
    });

    if (!prescription) {
      throw new NotFoundException('Prescription not found');
    }

    return prescription;
  }
}
