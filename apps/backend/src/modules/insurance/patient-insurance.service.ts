import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AssignInsuranceDto } from './dto/assign-insurance.dto';
import { InsurancePolicyService } from './insurance-policy.service';

@Injectable()
export class PatientInsuranceService {
  constructor(
    private prisma: PrismaService,
    private policyService: InsurancePolicyService,
  ) {}

  async assignToPatient(tenantId: string, dto: AssignInsuranceDto) {
    // Verify patient exists
    const patient = await this.prisma.patient.findFirst({
      where: { id: dto.patientId, tenantId },
    });

    if (!patient) {
      throw new NotFoundException('Patient not found');
    }

    // Verify policy exists and is valid
    const policy = await this.policyService.findOne(tenantId, dto.policyId);

    // Validate dates
    const startDate = new Date(dto.startDate);
    const endDate = new Date(dto.endDate);

    if (startDate >= endDate) {
      throw new BadRequestException('Start date must be before end date');
    }

    // Check if policy is valid for the requested dates
    if (startDate < policy.validFrom || endDate > policy.validUntil) {
      throw new BadRequestException(
        'Requested coverage dates are outside policy validity period'
      );
    }

    // Check if patient already has active insurance for this policy
    const existing = await this.prisma.patientInsurance.findFirst({
      where: {
        tenantId,
        patientId: dto.patientId,
        policyId: dto.policyId,
        status: 'ACTIVE',
      },
    });

    if (existing) {
      throw new BadRequestException(
        'Patient already has an active insurance for this policy'
      );
    }

    // Create patient insurance
    return this.prisma.patientInsurance.create({
      data: {
        ...dto,
        tenantId,
        startDate,
        endDate,
        remainingCoverage: dto.coverageAmount || policy.maxCoverage,
        status: 'ACTIVE',
      },
      include: {
        policy: {
          include: {
            company: true,
          },
        },
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

  async findByPatient(tenantId: string, patientId: string) {
    return this.prisma.patientInsurance.findMany({
      where: {
        tenantId,
        patientId,
      },
      include: {
        policy: {
          include: {
            company: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findActiveByPatient(tenantId: string, patientId: string) {
    const now = new Date();

    return this.prisma.patientInsurance.findMany({
      where: {
        tenantId,
        patientId,
        status: 'ACTIVE',
        startDate: { lte: now },
        endDate: { gte: now },
      },
      include: {
        policy: {
          include: {
            company: true,
          },
        },
      },
    });
  }

  async findOne(tenantId: string, id: string) {
    const insurance = await this.prisma.patientInsurance.findFirst({
      where: { id, tenantId },
      include: {
        policy: {
          include: {
            company: true,
          },
        },
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

    if (!insurance) {
      throw new NotFoundException('Patient insurance not found');
    }

    return insurance;
  }

  async updateStatus(tenantId: string, id: string, status: string) {
    await this.findOne(tenantId, id);

    return this.prisma.patientInsurance.update({
      where: { id },
      data: { status },
    });
  }

  async deductCoverage(tenantId: string, id: string, amount: number) {
    const insurance = await this.findOne(tenantId, id);

    if (!insurance.remainingCoverage) {
      throw new BadRequestException('No remaining coverage available');
    }

    if (insurance.remainingCoverage < amount) {
      throw new BadRequestException(
        `Insufficient coverage. Available: ${insurance.remainingCoverage}, Requested: ${amount}`
      );
    }

    return this.prisma.patientInsurance.update({
      where: { id },
      data: {
        remainingCoverage: insurance.remainingCoverage - amount,
      },
    });
  }
}
