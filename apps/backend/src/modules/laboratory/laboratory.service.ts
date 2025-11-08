import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateLabTestDto } from './dto/create-lab-test.dto';
import { UpdateLabTestDto } from './dto/update-lab-test.dto';

@Injectable()
export class LaboratoryService {
  constructor(private prisma: PrismaService) {}

  async create(tenantId: string, dto: CreateLabTestDto) {
    return this.prisma.labOrder.create({
      data: {
        tenantId,
        patientId: dto.patientId,
        labTestId: dto.labTestId,
        orderedById: dto.orderedById,
        testName: dto.testName,
        testCode: dto.testCode,
        sampleType: dto.sampleType,
        result: dto.result,
        unit: dto.unit,
        referenceRange: dto.referenceRange,
        status: dto.status as any || 'ORDERED',
        notes: dto.notes,
        opdVisitId: dto.opdVisitId,
        ipdAdmissionId: dto.ipdAdmissionId,
        resultDate: dto.result ? new Date() : null,
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
        labTest: {
          select: {
            id: true,
            name: true,
            category: true,
            price: true,
          },
        },
        orderedBy: {
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
      },
    });
  }

  async findAll(
    tenantId: string,
    page: number = 1,
    limit: number = 10,
    search?: string,
    status?: string,
    patientId?: string,
  ) {
    const skip = (page - 1) * limit;

    const where: any = {
      tenantId,
    };

    if (search) {
      where.OR = [
        { testName: { contains: search, mode: 'insensitive' } },
        { testCode: { contains: search, mode: 'insensitive' } },
        { patient: { firstName: { contains: search, mode: 'insensitive' } } },
        { patient: { lastName: { contains: search, mode: 'insensitive' } } },
        { patient: { patientId: { contains: search, mode: 'insensitive' } } },
      ];
    }

    if (status) {
      where.status = status;
    }

    if (patientId) {
      where.patientId = patientId;
    }

    const [labOrders, total] = await Promise.all([
      this.prisma.labOrder.findMany({
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
          labTest: {
            select: {
              id: true,
              name: true,
              category: true,
              price: true,
            },
          },
          orderedBy: {
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
        },
        orderBy: {
          orderDate: 'desc',
        },
      }),
      this.prisma.labOrder.count({ where }),
    ]);

    return {
      data: labOrders,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(tenantId: string, id: string) {
    const labOrder = await this.prisma.labOrder.findFirst({
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
          },
        },
        labTest: {
          select: {
            id: true,
            name: true,
            category: true,
            price: true,
            description: true,
          },
        },
        orderedBy: {
          select: {
            id: true,
            user: {
              select: {
                firstName: true,
                lastName: true,
                email: true,
              },
            },
          },
        },
        opdVisit: {
          select: {
            id: true,
            visitDate: true,
          },
        },
        ipdAdmission: {
          select: {
            id: true,
            admissionDate: true,
          },
        },
      },
    });

    if (!labOrder) {
      throw new NotFoundException('Lab test not found');
    }

    return labOrder;
  }

  async update(tenantId: string, id: string, dto: UpdateLabTestDto) {
    await this.findOne(tenantId, id);

    const updateData: any = {};

    if (dto.patientId) updateData.patientId = dto.patientId;
    if (dto.labTestId) updateData.labTestId = dto.labTestId;
    if (dto.orderedById) updateData.orderedById = dto.orderedById;
    if (dto.testName) updateData.testName = dto.testName;
    if (dto.testCode !== undefined) updateData.testCode = dto.testCode;
    if (dto.sampleType !== undefined) updateData.sampleType = dto.sampleType;
    if (dto.result !== undefined) {
      updateData.result = dto.result;
      if (dto.result && dto.status === 'COMPLETED') {
        updateData.resultDate = new Date();
      }
    }
    if (dto.unit !== undefined) updateData.unit = dto.unit;
    if (dto.referenceRange !== undefined) updateData.referenceRange = dto.referenceRange;
    if (dto.status) updateData.status = dto.status;
    if (dto.notes !== undefined) updateData.notes = dto.notes;
    if (dto.opdVisitId !== undefined) updateData.opdVisitId = dto.opdVisitId;
    if (dto.ipdAdmissionId !== undefined) updateData.ipdAdmissionId = dto.ipdAdmissionId;

    return this.prisma.labOrder.update({
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
        labTest: {
          select: {
            id: true,
            name: true,
            category: true,
            price: true,
          },
        },
        orderedBy: {
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
      },
    });
  }

  async remove(tenantId: string, id: string) {
    await this.findOne(tenantId, id);

    await this.prisma.labOrder.delete({
      where: { id },
    });

    return { message: 'Lab test deleted successfully' };
  }

  async getStats(tenantId: string) {
    const [total, ordered, inProgress, completed, cancelled] = await Promise.all([
      this.prisma.labOrder.count({ where: { tenantId } }),
      this.prisma.labOrder.count({
        where: { tenantId, status: 'ORDERED' },
      }),
      this.prisma.labOrder.count({
        where: { tenantId, status: 'IN_PROGRESS' },
      }),
      this.prisma.labOrder.count({
        where: { tenantId, status: 'COMPLETED' },
      }),
      this.prisma.labOrder.count({
        where: { tenantId, status: 'CANCELLED' },
      }),
    ]);

    return {
      total,
      ordered,
      inProgress,
      completed,
      cancelled,
    };
  }
}
