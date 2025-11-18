import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateOpdDto } from './dto/create-opd.dto';
import { UpdateOpdDto } from './dto/update-opd.dto';

@Injectable()
export class OpdService {
  constructor(private prisma: PrismaService) {}

  async create(tenantId: string, dto: CreateOpdDto) {
    return this.prisma.oPDVisit.create({
      data: {
        tenantId,
        patientId: dto.patientId,
        doctorId: dto.doctorId,
        departmentId: dto.departmentId,
        visitDate: new Date(dto.visitDate),
        chiefComplaint: dto.chiefComplaint,
        diagnosis: dto.diagnosis,
        notes: dto.notes,
        fee: dto.fee,
        status: dto.status || 'PENDING',
        vitals: dto.vitals || null,
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
                role: true,
              },
            },
          },
        },
        department: true,
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
    departmentId?: string,
    status?: string,
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
        { patient: { phone: { contains: search, mode: 'insensitive' } } },
        { patient: { aadhaarNumber: { contains: search, mode: 'insensitive' } } },
        { chiefComplaint: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (patientId) {
      where.patientId = patientId;
    }

    if (doctorId) {
      where.doctorId = doctorId;
    }

    if (departmentId) {
      where.departmentId = departmentId;
    }

    if (status) {
      where.status = status;
    }

    const [visits, total] = await Promise.all([
      this.prisma.oPDVisit.findMany({
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
              dateOfBirth: true,
              gender: true,
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
                  role: true,
                },
              },
            },
          },
          department: true,
        },
        orderBy: {
          visitDate: 'desc',
        },
      }),
      this.prisma.oPDVisit.count({ where }),
    ]);

    return {
      data: visits,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(tenantId: string, id: string) {
    const visit = await this.prisma.oPDVisit.findFirst({
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
            bloodGroup: true,
            allergies: true,
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
                role: true,
              },
            },
            department: true,
          },
        },
        department: true,
        prescriptions: {
          include: {
            items: {
              include: {
                medicine: true,
              },
            },
          },
        },
        labOrders: {
          include: {
            labTest: true,
          },
        },
      },
    });

    if (!visit) {
      throw new NotFoundException('OPD visit not found');
    }

    return visit;
  }

  async update(tenantId: string, id: string, dto: UpdateOpdDto) {
    await this.findOne(tenantId, id);

    const updateData: any = {};

    if (dto.patientId) updateData.patientId = dto.patientId;
    if (dto.doctorId) updateData.doctorId = dto.doctorId;
    if (dto.departmentId !== undefined) updateData.departmentId = dto.departmentId;
    if (dto.visitDate) updateData.visitDate = new Date(dto.visitDate);
    if (dto.chiefComplaint) updateData.chiefComplaint = dto.chiefComplaint;
    if (dto.diagnosis !== undefined) updateData.diagnosis = dto.diagnosis;
    if (dto.notes !== undefined) updateData.notes = dto.notes;
    if (dto.fee !== undefined) updateData.fee = dto.fee;
    if (dto.status) updateData.status = dto.status;
    if (dto.vitals !== undefined) updateData.vitals = dto.vitals;

    return this.prisma.oPDVisit.update({
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
                role: true,
              },
            },
          },
        },
        department: true,
      },
    });
  }

  async remove(tenantId: string, id: string) {
    await this.findOne(tenantId, id);

    await this.prisma.oPDVisit.delete({
      where: { id },
    });

    return { message: 'OPD visit deleted successfully' };
  }

  async getStats(tenantId: string) {
    const [total, today, pending, completed] = await Promise.all([
      this.prisma.oPDVisit.count({ where: { tenantId } }),
      this.prisma.oPDVisit.count({
        where: {
          tenantId,
          visitDate: {
            gte: new Date(new Date().setHours(0, 0, 0, 0)),
            lt: new Date(new Date().setHours(23, 59, 59, 999)),
          },
        },
      }),
      this.prisma.oPDVisit.count({
        where: { tenantId, status: 'PENDING' },
      }),
      this.prisma.oPDVisit.count({
        where: { tenantId, status: 'COMPLETED' },
      }),
    ]);

    return {
      total,
      today,
      pending,
      completed,
    };
  }
}
