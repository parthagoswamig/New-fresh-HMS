import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { RadiologyStatus } from '@prisma/client';
import { CreateRadiologyTestDto } from './dto/create-radiology-test.dto';
import { UpdateRadiologyTestDto } from './dto/update-radiology-test.dto';
import { AssignTestDto } from './dto/assign-test.dto';
import { UpdateResultDto } from './dto/update-result.dto';

@Injectable()
export class RadiologyService {
  constructor(private prisma: PrismaService) {}

  // ==================== RADIOLOGY TEST MANAGEMENT ====================

  async createTest(tenantId: string, dto: CreateRadiologyTestDto) {
    // Check if code already exists for this tenant
    const existing = await this.prisma.radiologyTest.findUnique({
      where: {
        tenantId_code: {
          tenantId,
          code: dto.code,
        },
      },
    });

    if (existing) {
      throw new BadRequestException(`Test with code "${dto.code}" already exists`);
    }

    return this.prisma.radiologyTest.create({
      data: {
        ...dto,
        tenantId,
      },
    });
  }

  async findAllTests(
    tenantId: string,
    page: number = 1,
    limit: number = 10,
    search?: string,
  ) {
    const skip = (page - 1) * limit;

    const where: any = {
      tenantId,
      isActive: true,
    };

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { code: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [tests, total] = await Promise.all([
      this.prisma.radiologyTest.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.radiologyTest.count({ where }),
    ]);

    return {
      data: tests,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findTestById(tenantId: string, id: string) {
    const test = await this.prisma.radiologyTest.findFirst({
      where: { id, tenantId },
    });

    if (!test) {
      throw new NotFoundException('Radiology test not found');
    }

    return test;
  }

  async updateTest(tenantId: string, id: string, dto: UpdateRadiologyTestDto) {
    await this.findTestById(tenantId, id);

    return this.prisma.radiologyTest.update({
      where: { id },
      data: dto,
    });
  }

  async deleteTest(tenantId: string, id: string) {
    await this.findTestById(tenantId, id);

    // Soft delete
    return this.prisma.radiologyTest.update({
      where: { id },
      data: { isActive: false },
    });
  }

  // ==================== PATIENT RADIOLOGY MANAGEMENT ====================

  async assignTest(tenantId: string, userId: string, dto: AssignTestDto) {
    // Validate staff exists
    const staff = await this.prisma.staff.findUnique({
      where: { id: userId },
    });

    if (!staff) {
      throw new BadRequestException(
        `Staff record not found for ID: ${userId}. Please ensure you have a staff profile.`
      );
    }

    // Validate patient exists
    const patient = await this.prisma.patient.findFirst({
      where: { id: dto.patientId, tenantId },
    });

    if (!patient) {
      throw new NotFoundException('Patient not found');
    }

    // Validate test exists
    const test = await this.prisma.radiologyTest.findFirst({
      where: { id: dto.testId, tenantId, isActive: true },
    });

    if (!test) {
      throw new NotFoundException('Radiology test not found or inactive');
    }

    return this.prisma.patientRadiology.create({
      data: {
        tenantId,
        patientId: dto.patientId,
        testId: dto.testId,
        createdById: userId,
        status: RadiologyStatus.PENDING,
      },
      include: {
        radiologyTest: true,
        patient: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            patientId: true,
          },
        },
      },
    });
  }

  async findPatientTests(tenantId: string, patientId: string) {
    return this.prisma.patientRadiology.findMany({
      where: {
        tenantId,
        patientId,
      },
      include: {
        radiologyTest: true,
        createdBy: {
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
      orderBy: { createdAt: 'desc' },
    });
  }

  async updateResult(tenantId: string, id: string, dto: UpdateResultDto) {
    const patientTest = await this.prisma.patientRadiology.findFirst({
      where: { id, tenantId },
    });

    if (!patientTest) {
      throw new NotFoundException('Patient radiology test not found');
    }

    return this.prisma.patientRadiology.update({
      where: { id },
      data: {
        resultSummary: dto.resultSummary,
        radiologist: dto.radiologist,
        reportUrl: dto.reportUrl,
        status: dto.status,
      },
      include: {
        radiologyTest: true,
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
      },
    });
  }

  async getReport(tenantId: string, id: string) {
    const report = await this.prisma.patientRadiology.findFirst({
      where: { id, tenantId },
      include: {
        radiologyTest: true,
        patient: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            patientId: true,
            dateOfBirth: true,
            gender: true,
            phone: true,
          },
        },
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

    if (!report) {
      throw new NotFoundException('Radiology report not found');
    }

    if (report.status !== RadiologyStatus.COMPLETED) {
      throw new BadRequestException('Report is not yet completed');
    }

    return report;
  }

  async getStats(tenantId: string) {
    const [total, pending, inProgress, completed] = await Promise.all([
      this.prisma.patientRadiology.count({ where: { tenantId } }),
      this.prisma.patientRadiology.count({ 
        where: { tenantId, status: RadiologyStatus.PENDING } 
      }),
      this.prisma.patientRadiology.count({ 
        where: { tenantId, status: RadiologyStatus.IN_PROGRESS } 
      }),
      this.prisma.patientRadiology.count({ 
        where: { tenantId, status: RadiologyStatus.COMPLETED } 
      }),
    ]);

    return {
      total,
      pending,
      inProgress,
      completed,
    };
  }
}
