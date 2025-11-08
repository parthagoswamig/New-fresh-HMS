import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateIpdDto } from './dto/create-ipd.dto';
import { UpdateIpdDto } from './dto/update-ipd.dto';

@Injectable()
export class IpdService {
  constructor(private prisma: PrismaService) {}

  async create(tenantId: string, dto: CreateIpdDto) {
    return this.prisma.iPDAdmission.create({
      data: {
        tenantId,
        patientId: dto.patientId,
        doctorId: dto.doctorId,
        departmentId: dto.departmentId,
        bedId: dto.bedId,
        admissionDate: new Date(dto.admissionDate),
        dischargeDate: dto.dischargeDate ? new Date(dto.dischargeDate) : null,
        admissionReason: dto.admissionReason,
        diagnosis: dto.diagnosis,
        treatmentPlan: dto.treatmentPlan,
        roomNumber: dto.roomNumber,
        bedNumber: dto.bedNumber,
        dischargeSummary: dto.dischargeSummary,
        status: dto.status || 'ADMITTED',
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
        bed: {
          include: {
            ward: true,
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
        { admissionReason: { contains: search, mode: 'insensitive' } },
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

    const [admissions, total] = await Promise.all([
      this.prisma.iPDAdmission.findMany({
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
          bed: {
            include: {
              ward: true,
            },
          },
        },
        orderBy: {
          admissionDate: 'desc',
        },
      }),
      this.prisma.iPDAdmission.count({ where }),
    ]);

    return {
      data: admissions,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(tenantId: string, id: string) {
    const admission = await this.prisma.iPDAdmission.findFirst({
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
                role: true,
              },
            },
            department: true,
          },
        },
        department: true,
        bed: {
          include: {
            ward: true,
          },
        },
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

    if (!admission) {
      throw new NotFoundException('IPD admission not found');
    }

    return admission;
  }

  async update(tenantId: string, id: string, dto: UpdateIpdDto) {
    await this.findOne(tenantId, id);

    const updateData: any = {};

    if (dto.patientId) updateData.patientId = dto.patientId;
    if (dto.doctorId) updateData.doctorId = dto.doctorId;
    if (dto.departmentId !== undefined) updateData.departmentId = dto.departmentId;
    if (dto.bedId !== undefined) updateData.bedId = dto.bedId;
    if (dto.admissionDate) updateData.admissionDate = new Date(dto.admissionDate);
    if (dto.dischargeDate !== undefined)
      updateData.dischargeDate = dto.dischargeDate ? new Date(dto.dischargeDate) : null;
    if (dto.admissionReason) updateData.admissionReason = dto.admissionReason;
    if (dto.diagnosis !== undefined) updateData.diagnosis = dto.diagnosis;
    if (dto.treatmentPlan !== undefined) updateData.treatmentPlan = dto.treatmentPlan;
    if (dto.roomNumber !== undefined) updateData.roomNumber = dto.roomNumber;
    if (dto.bedNumber !== undefined) updateData.bedNumber = dto.bedNumber;
    if (dto.dischargeSummary !== undefined) updateData.dischargeSummary = dto.dischargeSummary;
    if (dto.status) updateData.status = dto.status;

    return this.prisma.iPDAdmission.update({
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
        bed: {
          include: {
            ward: true,
          },
        },
      },
    });
  }

  async remove(tenantId: string, id: string) {
    await this.findOne(tenantId, id);

    await this.prisma.iPDAdmission.delete({
      where: { id },
    });

    return { message: 'IPD admission deleted successfully' };
  }

  async getStats(tenantId: string) {
    const [total, admitted, discharged, underTreatment] = await Promise.all([
      this.prisma.iPDAdmission.count({ where: { tenantId } }),
      this.prisma.iPDAdmission.count({
        where: { tenantId, status: 'ADMITTED' },
      }),
      this.prisma.iPDAdmission.count({
        where: { tenantId, status: 'DISCHARGED' },
      }),
      this.prisma.iPDAdmission.count({
        where: { tenantId, status: 'UNDER_TREATMENT' },
      }),
    ]);

    return {
      total,
      admitted,
      discharged,
      underTreatment,
    };
  }
}
