import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateSurgeryDto } from './dto/create-surgery.dto';
import { UpdateSurgeryDto } from './dto/update-surgery.dto';

@Injectable()
export class SurgeryService {
  constructor(private prisma: PrismaService) {}

  async create(tenantId: string, userId: string, dto: CreateSurgeryDto) {
    // Check OT room availability
    await this.checkOTAvailability(tenantId, dto.otRoomId, new Date(dto.scheduledDate));

    // Generate surgery number
    const surgeryNumber = await this.generateSurgeryNumber(tenantId);

    return this.prisma.surgery.create({
      data: {
        tenantId,
        surgeryNumber,
        patientId: dto.patientId,
        surgeonId: dto.surgeonId,
        assistantIds: dto.assistantIds || [],
        anesthesiologistId: dto.anesthesiologistId,
        otRoomId: dto.otRoomId,
        surgeryType: dto.surgeryType as any,
        procedureName: dto.procedureName,
        scheduledDate: new Date(dto.scheduledDate),
        preOpDiagnosis: dto.preOpDiagnosis,
        preOpNote: dto.preOpNote,
        requiredEquipment: dto.requiredEquipment as any,
        estimatedCost: dto.estimatedCost,
        consentFormUrl: dto.consentFormUrl,
        createdById: userId,
      },
      include: {
        patient: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            patientId: true,
            dateOfBirth: true,
            gender: true,
          },
        },
        surgeon: {
          select: {
            id: true,
            employeeId: true,
            user: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
          },
        },
        operatingRoom: true,
      },
    });
  }

  private async generateSurgeryNumber(tenantId: string): Promise<string> {
    const count = await this.prisma.surgery.count({
      where: { tenantId },
    });

    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const sequence = String(count + 1).padStart(4, '0');

    return `SUR-${year}${month}-${sequence}`;
  }

  private async checkOTAvailability(
    tenantId: string,
    otRoomId: string,
    scheduledDate: Date,
  ): Promise<void> {
    // Check if OT room exists and is active
    const otRoom = await this.prisma.operatingRoom.findFirst({
      where: { id: otRoomId, tenantId, isActive: true },
    });

    if (!otRoom) {
      throw new BadRequestException('Operating room not found or inactive');
    }

    // Check for overlapping surgeries (within 4 hours window)
    const startWindow = new Date(scheduledDate.getTime() - 2 * 60 * 60 * 1000);
    const endWindow = new Date(scheduledDate.getTime() + 2 * 60 * 60 * 1000);

    const overlapping = await this.prisma.surgery.findFirst({
      where: {
        tenantId,
        otRoomId,
        scheduledDate: {
          gte: startWindow,
          lte: endWindow,
        },
        status: {
          in: ['SCHEDULED', 'IN_PROGRESS'],
        },
      },
    });

    if (overlapping) {
      throw new BadRequestException(
        'Operating room is not available at this time. Another surgery is scheduled.',
      );
    }
  }

  async findAll(
    tenantId: string,
    page: number = 1,
    limit: number = 10,
    search?: string,
    status?: string,
    surgeryType?: string,
    startDate?: string,
    endDate?: string,
  ) {
    const skip = (page - 1) * limit;

    const where: any = { tenantId };

    if (search) {
      where.OR = [
        { surgeryNumber: { contains: search, mode: 'insensitive' } },
        { procedureName: { contains: search, mode: 'insensitive' } },
        { patient: { firstName: { contains: search, mode: 'insensitive' } } },
        { patient: { lastName: { contains: search, mode: 'insensitive' } } },
        { patient: { patientId: { contains: search, mode: 'insensitive' } } },
        { patient: { phone: { contains: search, mode: 'insensitive' } } },
        { patient: { aadhaarNumber: { contains: search, mode: 'insensitive' } } },
      ];
    }

    if (status) {
      where.status = status;
    }

    if (surgeryType) {
      where.surgeryType = surgeryType;
    }

    if (startDate || endDate) {
      where.scheduledDate = {};
      if (startDate) {
        where.scheduledDate.gte = new Date(startDate);
      }
      if (endDate) {
        where.scheduledDate.lte = new Date(endDate);
      }
    }

    const [surgeries, total] = await Promise.all([
      this.prisma.surgery.findMany({
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
            },
          },
          surgeon: {
            select: {
              id: true,
              user: {
                select: {
                  firstName: true,
                  lastName: true,
                },
              },
            },
          },
          operatingRoom: {
            select: {
              id: true,
              name: true,
              roomNumber: true,
            },
          },
        },
        orderBy: { scheduledDate: 'desc' },
      }),
      this.prisma.surgery.count({ where }),
    ]);

    return {
      data: surgeries,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(tenantId: string, id: string) {
    const surgery = await this.prisma.surgery.findFirst({
      where: { id, tenantId },
      include: {
        patient: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            patientId: true,
            dateOfBirth: true,
            gender: true,
            phone: true,
            bloodGroup: true,
          },
        },
        surgeon: {
          select: {
            id: true,
            employeeId: true,
            user: {
              select: {
                firstName: true,
                lastName: true,
                email: true,
              },
            },
            specialization: true,
          },
        },
        anesthesiologist: {
          select: {
            id: true,
            user: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
          },
        },
        operatingRoom: true,
        bill: true,
        createdBy: {
          select: {
            user: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
          },
        },
      },
    });

    if (!surgery) {
      throw new NotFoundException('Surgery not found');
    }

    return surgery;
  }

  async update(tenantId: string, id: string, dto: UpdateSurgeryDto) {
    const surgery = await this.findOne(tenantId, id);

    // Prevent editing completed surgeries
    if (surgery.status === 'COMPLETED' && dto.status !== 'COMPLETED') {
      throw new BadRequestException('Cannot modify completed surgery');
    }

    // If changing OT room or schedule, check availability
    if (dto.otRoomId || dto.scheduledDate) {
      const newOtRoomId = dto.otRoomId || surgery.otRoomId;
      const newScheduledDate = dto.scheduledDate
        ? new Date(dto.scheduledDate)
        : surgery.scheduledDate;

      await this.checkOTAvailability(tenantId, newOtRoomId, newScheduledDate);
    }

    return this.prisma.surgery.update({
      where: { id },
      data: {
        patientId: dto.patientId,
        surgeonId: dto.surgeonId,
        assistantIds: dto.assistantIds,
        anesthesiologistId: dto.anesthesiologistId,
        otRoomId: dto.otRoomId,
        surgeryType: dto.surgeryType as any,
        procedureName: dto.procedureName,
        scheduledDate: dto.scheduledDate ? new Date(dto.scheduledDate) : undefined,
        status: dto.status as any,
        preOpDiagnosis: dto.preOpDiagnosis,
        postOpDiagnosis: dto.postOpDiagnosis,
        preOpNote: dto.preOpNote,
        postOpNote: dto.postOpNote,
        complications: dto.complications,
        bloodLoss: dto.bloodLoss,
        duration: dto.duration,
        startTime: dto.startTime ? new Date(dto.startTime) : undefined,
        endTime: dto.endTime ? new Date(dto.endTime) : undefined,
        actualCost: dto.actualCost,
        requiredEquipment: dto.requiredEquipment as any,
        implants: dto.implants as any,
        consentFormUrl: dto.consentFormUrl,
      },
      include: {
        patient: true,
        surgeon: true,
        operatingRoom: true,
      },
    });
  }

  async updateStatus(
    tenantId: string,
    id: string,
    status: string,
    userId: string,
  ) {
    const surgery = await this.findOne(tenantId, id);

    // Validate status transitions
    this.validateStatusTransition(surgery.status, status);

    const updateData: any = { status };

    if (status === 'IN_PROGRESS' && !surgery.startTime) {
      updateData.startTime = new Date();
    }

    if (status === 'COMPLETED' && !surgery.endTime) {
      updateData.endTime = new Date();
      // Calculate duration if not set
      if (surgery.startTime) {
        const duration = Math.floor(
          (new Date().getTime() - surgery.startTime.getTime()) / 60000,
        );
        updateData.duration = duration;
      }
    }

    return this.prisma.surgery.update({
      where: { id },
      data: updateData,
    });
  }

  private validateStatusTransition(currentStatus: string, newStatus: string) {
    const validTransitions: Record<string, string[]> = {
      SCHEDULED: ['IN_PROGRESS', 'CANCELLED'],
      IN_PROGRESS: ['COMPLETED', 'CANCELLED'],
      COMPLETED: [], // Cannot change from completed
      CANCELLED: [], // Cannot change from cancelled
    };

    if (!validTransitions[currentStatus]?.includes(newStatus)) {
      throw new BadRequestException(
        `Invalid status transition from ${currentStatus} to ${newStatus}`,
      );
    }
  }

  async cancel(tenantId: string, id: string, reason: string, userId: string) {
    const surgery = await this.findOne(tenantId, id);

    if (surgery.status === 'COMPLETED') {
      throw new BadRequestException('Cannot cancel completed surgery');
    }

    if (surgery.status === 'CANCELLED') {
      throw new BadRequestException('Surgery is already cancelled');
    }

    return this.prisma.surgery.update({
      where: { id },
      data: {
        status: 'CANCELLED',
        cancelReason: reason,
        cancelledAt: new Date(),
        cancelledById: userId,
      },
    });
  }

  async remove(tenantId: string, id: string) {
    const surgery = await this.findOne(tenantId, id);

    if (surgery.status !== 'SCHEDULED') {
      throw new BadRequestException('Can only delete scheduled surgeries');
    }

    await this.prisma.surgery.delete({
      where: { id },
    });

    return { message: 'Surgery deleted successfully' };
  }

  async getStats(tenantId: string, startDate?: string, endDate?: string) {
    const where: any = { tenantId };

    if (startDate || endDate) {
      where.scheduledDate = {};
      if (startDate) {
        where.scheduledDate.gte = new Date(startDate);
      }
      if (endDate) {
        where.scheduledDate.lte = new Date(endDate);
      }
    }

    const [
      total,
      scheduled,
      inProgress,
      completed,
      cancelled,
      byType,
      bySurgeon,
      avgCost,
    ] = await Promise.all([
      this.prisma.surgery.count({ where }),
      this.prisma.surgery.count({ where: { ...where, status: 'SCHEDULED' } }),
      this.prisma.surgery.count({ where: { ...where, status: 'IN_PROGRESS' } }),
      this.prisma.surgery.count({ where: { ...where, status: 'COMPLETED' } }),
      this.prisma.surgery.count({ where: { ...where, status: 'CANCELLED' } }),
      this.prisma.surgery.groupBy({
        by: ['surgeryType'],
        where,
        _count: true,
      }),
      this.prisma.surgery.groupBy({
        by: ['surgeonId'],
        where: { ...where, status: 'COMPLETED' },
        _count: true,
        orderBy: { _count: { surgeonId: 'desc' } },
        take: 5,
      }),
      this.prisma.surgery.aggregate({
        where: { ...where, status: 'COMPLETED' },
        _avg: { actualCost: true, duration: true },
      }),
    ]);

    return {
      total,
      scheduled,
      inProgress,
      completed,
      cancelled,
      byType: byType.map((item) => ({
        type: item.surgeryType,
        count: item._count,
      })),
      topSurgeons: await this.enrichSurgeonStats(bySurgeon),
      avgCost: avgCost._avg.actualCost || 0,
      avgDuration: avgCost._avg.duration || 0,
    };
  }

  private async enrichSurgeonStats(surgeonStats: any[]) {
    const surgeonIds = surgeonStats.map((s) => s.surgeonId);
    const surgeons = await this.prisma.staff.findMany({
      where: { id: { in: surgeonIds } },
      select: {
        id: true,
        user: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    return surgeonStats.map((stat) => {
      const surgeon = surgeons.find((s) => s.id === stat.surgeonId);
      return {
        surgeonId: stat.surgeonId,
        surgeonName: surgeon
          ? `${surgeon.user.firstName} ${surgeon.user.lastName}`
          : 'Unknown',
        count: stat._count,
      };
    });
  }

  // Operating Room Management
  async createOT(tenantId: string, data: any) {
    return this.prisma.operatingRoom.create({
      data: {
        tenantId,
        ...data,
      },
    });
  }

  async listOTs(tenantId: string) {
    return this.prisma.operatingRoom.findMany({
      where: { tenantId, isActive: true },
      orderBy: { roomNumber: 'asc' },
    });
  }
}
