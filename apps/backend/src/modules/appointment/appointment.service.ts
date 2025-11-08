import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';

@Injectable()
export class AppointmentService {
  constructor(private prisma: PrismaService) {}

  async create(tenantId: string, dto: CreateAppointmentDto) {
    // Check for conflicting appointments
    const conflict = await this.prisma.appointment.findFirst({
      where: {
        tenantId,
        doctorId: dto.doctorId,
        appointmentDate: new Date(dto.appointmentDate),
        appointmentTime: dto.appointmentTime,
        status: { not: 'CANCELLED' },
      },
    });

    if (conflict) {
      throw new ConflictException('Doctor already has an appointment at this time');
    }

    return this.prisma.appointment.create({
      data: {
        tenantId,
        patientId: dto.patientId,
        doctorId: dto.doctorId,
        appointmentDate: new Date(dto.appointmentDate),
        appointmentTime: dto.appointmentTime,
        reason: dto.reason,
        notes: dto.notes,
        status: dto.status || 'PENDING',
      },
      include: {
        patient: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            patientId: true,
            phone: true,
            email: true,
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
    });
  }

  async findAll(
    tenantId: string,
    page: number = 1,
    limit: number = 10,
    search?: string,
    patientId?: string,
    doctorId?: string,
    status?: string,
    date?: string,
  ) {
    const skip = (page - 1) * limit;

    const where: any = {
      tenantId,
    };

    if (search) {
      where.OR = [
        { patient: { firstName: { contains: search, mode: 'insensitive' } } },
        { patient: { lastName: { contains: search, mode: 'insensitive' } } },
        { patient: { patientId: { contains: search, mode: 'insensitive' } } },
        { reason: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (patientId) {
      where.patientId = patientId;
    }

    if (doctorId) {
      where.doctorId = doctorId;
    }

    if (status) {
      where.status = status;
    }

    if (date) {
      const startDate = new Date(date);
      startDate.setHours(0, 0, 0, 0);
      const endDate = new Date(date);
      endDate.setHours(23, 59, 59, 999);

      where.appointmentDate = {
        gte: startDate,
        lte: endDate,
      };
    }

    const [appointments, total] = await Promise.all([
      this.prisma.appointment.findMany({
        where,
        skip,
        take: limit,
        include: {
          patient: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              patientId: true,
              phone: true,
              email: true,
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
        orderBy: [
          { appointmentDate: 'asc' },
          { appointmentTime: 'asc' },
        ],
      }),
      this.prisma.appointment.count({ where }),
    ]);

    return {
      data: appointments,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(tenantId: string, id: string) {
    const appointment = await this.prisma.appointment.findFirst({
      where: {
        id,
        tenantId,
      },
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
    });

    if (!appointment) {
      throw new NotFoundException('Appointment not found');
    }

    return appointment;
  }

  async update(tenantId: string, id: string, dto: UpdateAppointmentDto) {
    await this.findOne(tenantId, id);

    // Check for conflicts if date/time/doctor is being updated
    if (dto.doctorId || dto.appointmentDate || dto.appointmentTime) {
      const appointment = await this.prisma.appointment.findUnique({
        where: { id },
      });

      const conflict = await this.prisma.appointment.findFirst({
        where: {
          tenantId,
          doctorId: dto.doctorId || appointment.doctorId,
          appointmentDate: dto.appointmentDate
            ? new Date(dto.appointmentDate)
            : appointment.appointmentDate,
          appointmentTime: dto.appointmentTime || appointment.appointmentTime,
          status: { not: 'CANCELLED' },
          NOT: { id },
        },
      });

      if (conflict) {
        throw new ConflictException('Doctor already has an appointment at this time');
      }
    }

    const updateData: any = {};

    if (dto.patientId) updateData.patientId = dto.patientId;
    if (dto.doctorId) updateData.doctorId = dto.doctorId;
    if (dto.appointmentDate) updateData.appointmentDate = new Date(dto.appointmentDate);
    if (dto.appointmentTime) updateData.appointmentTime = dto.appointmentTime;
    if (dto.reason !== undefined) updateData.reason = dto.reason;
    if (dto.notes !== undefined) updateData.notes = dto.notes;
    if (dto.status) updateData.status = dto.status;

    return this.prisma.appointment.update({
      where: { id },
      data: updateData,
      include: {
        patient: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            patientId: true,
            phone: true,
            email: true,
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
    });
  }

  async remove(tenantId: string, id: string) {
    await this.findOne(tenantId, id);

    await this.prisma.appointment.delete({
      where: { id },
    });

    return { message: 'Appointment deleted successfully' };
  }

  async getStats(tenantId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const [total, todayCount, pending, confirmed, completed, cancelled] = await Promise.all([
      this.prisma.appointment.count({ where: { tenantId } }),
      this.prisma.appointment.count({
        where: {
          tenantId,
          appointmentDate: {
            gte: today,
            lt: tomorrow,
          },
        },
      }),
      this.prisma.appointment.count({
        where: { tenantId, status: 'PENDING' },
      }),
      this.prisma.appointment.count({
        where: { tenantId, status: 'CONFIRMED' },
      }),
      this.prisma.appointment.count({
        where: { tenantId, status: 'COMPLETED' },
      }),
      this.prisma.appointment.count({
        where: { tenantId, status: 'CANCELLED' },
      }),
    ]);

    return {
      total,
      today: todayCount,
      pending,
      confirmed,
      completed,
      cancelled,
    };
  }
}
