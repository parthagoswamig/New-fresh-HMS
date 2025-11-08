import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ClaimStatus } from '@prisma/client';
import { CreateClaimDto } from './dto/create-claim.dto';
import { UpdateClaimStatusDto, ClaimStatusEnum } from './dto/update-claim-status.dto';
import { PatientInsuranceService } from './patient-insurance.service';
import { InsurancePolicyService } from './insurance-policy.service';

@Injectable()
export class InsuranceClaimService {
  constructor(
    private prisma: PrismaService,
    private patientInsuranceService: PatientInsuranceService,
    private policyService: InsurancePolicyService,
  ) {}

  async create(tenantId: string, userId: string, dto: CreateClaimDto) {
    // Validate staff exists
    const staff = await this.prisma.staff.findUnique({
      where: { id: userId },
    });

    if (!staff) {
      throw new BadRequestException(
        `Staff record not found for ID: ${userId}. Please ensure you have a staff profile.`
      );
    }

    // Verify patient exists
    const patient = await this.prisma.patient.findFirst({
      where: { id: dto.patientId, tenantId },
    });

    if (!patient) {
      throw new NotFoundException('Patient not found');
    }

    // Verify policy exists and is valid
    const policy = await this.policyService.findOne(tenantId, dto.policyId);

    // Check if patient has active insurance for this policy
    const patientInsurance = await this.prisma.patientInsurance.findFirst({
      where: {
        tenantId,
        patientId: dto.patientId,
        policyId: dto.policyId,
        status: 'ACTIVE',
      },
    });

    if (!patientInsurance) {
      throw new BadRequestException(
        'Patient does not have active insurance for this policy'
      );
    }

    // Calculate total amount
    const totalAmount = dto.services.reduce((sum, service) => sum + service.cost, 0);

    // Calculate coverage
    const { deductible, coveredAmount, patientBalance } = this.calculateCoverage(
      totalAmount,
      policy.deductible,
      policy.coveragePercent,
      patientInsurance.remainingCoverage
    );

    // Generate claim number
    const claimNumber = await this.generateClaimNumber(tenantId);

    // Create claim
    return this.prisma.insuranceClaim.create({
      data: {
        tenantId,
        patientId: dto.patientId,
        policyId: dto.policyId,
        claimNumber,
        billId: dto.billId,
        serviceDate: new Date(dto.serviceDate),
        services: dto.services as any,
        totalAmount,
        deductible,
        coveredAmount,
        patientBalance,
        status: ClaimStatus.INITIATED,
        createdById: userId,
      },
      include: {
        patient: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            patientId: true,
          },
        },
        policy: {
          include: {
            company: true,
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
  }

  private calculateCoverage(
    totalAmount: number,
    deductible: number,
    coveragePercent: number,
    remainingCoverage?: number | null,
  ) {
    // Step 1: Apply deductible
    const amountAfterDeductible = Math.max(0, totalAmount - deductible);

    // Step 2: Calculate coverage
    let coveredAmount = amountAfterDeductible * (coveragePercent / 100);

    // Step 3: Check remaining coverage limit
    if (remainingCoverage !== null && remainingCoverage !== undefined) {
      coveredAmount = Math.min(coveredAmount, remainingCoverage);
    }

    // Step 4: Calculate patient balance
    const patientBalance = totalAmount - coveredAmount;

    return {
      deductible,
      coveredAmount: Math.round(coveredAmount * 100) / 100,
      patientBalance: Math.round(patientBalance * 100) / 100,
    };
  }

  private async generateClaimNumber(tenantId: string): Promise<string> {
    const count = await this.prisma.insuranceClaim.count({
      where: { tenantId },
    });

    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const sequence = String(count + 1).padStart(4, '0');

    return `CLM-${year}${month}-${sequence}`;
  }

  async findAll(
    tenantId: string,
    page: number = 1,
    limit: number = 10,
    status?: string,
    patientId?: string,
  ) {
    const skip = (page - 1) * limit;

    const where: any = { tenantId };

    if (status) {
      where.status = status;
    }

    if (patientId) {
      where.patientId = patientId;
    }

    const [claims, total] = await Promise.all([
      this.prisma.insuranceClaim.findMany({
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
          policy: {
            include: {
              company: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.insuranceClaim.count({ where }),
    ]);

    return {
      data: claims,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(tenantId: string, id: string) {
    const claim = await this.prisma.insuranceClaim.findFirst({
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
          },
        },
        policy: {
          include: {
            company: true,
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
        bill: true,
      },
    });

    if (!claim) {
      throw new NotFoundException('Insurance claim not found');
    }

    return claim;
  }

  async updateStatus(tenantId: string, id: string, userId: string, dto: UpdateClaimStatusDto) {
    const claim = await this.findOne(tenantId, id);

    const updateData: any = {
      status: dto.status as ClaimStatus,
      reviewNotes: dto.reviewNotes,
    };

    // Handle approval
    if (dto.status === ClaimStatusEnum.APPROVED) {
      updateData.approvedBy = userId;
      updateData.approvedDate = new Date();

      // Update bill if linked
      if (claim.billId) {
        await this.updateBillWithClaim(claim.billId, claim.coveredAmount);
      }

      // Deduct from patient insurance coverage
      const patientInsurance = await this.prisma.patientInsurance.findFirst({
        where: {
          tenantId,
          patientId: claim.patientId,
          policyId: claim.policyId,
          status: 'ACTIVE',
        },
      });

      if (patientInsurance && patientInsurance.remainingCoverage) {
        await this.patientInsuranceService.deductCoverage(
          tenantId,
          patientInsurance.id,
          claim.coveredAmount
        );
      }
    }

    // Handle rejection
    if (dto.status === ClaimStatusEnum.REJECTED) {
      updateData.rejectionReason = dto.rejectionReason;
    }

    return this.prisma.insuranceClaim.update({
      where: { id },
      data: updateData,
      include: {
        patient: true,
        policy: {
          include: {
            company: true,
          },
        },
      },
    });
  }

  private async updateBillWithClaim(billId: string, coveredAmount: number) {
    const bill = await this.prisma.bill.findUnique({
      where: { id: billId },
    });

    if (bill) {
      await this.prisma.bill.update({
        where: { id: billId },
        data: {
          insuranceCovered: bill.insuranceCovered + coveredAmount,
        },
      });
    }
  }

  async addDocuments(tenantId: string, id: string, documents: any[]) {
    const claim = await this.findOne(tenantId, id);

    const existingDocs = (claim.documents as any[]) || [];
    const updatedDocs = [...existingDocs, ...documents];

    return this.prisma.insuranceClaim.update({
      where: { id },
      data: {
        documents: updatedDocs as any,
      },
    });
  }

  async getStats(tenantId: string) {
    const [total, initiated, underReview, approved, rejected] = await Promise.all([
      this.prisma.insuranceClaim.count({ where: { tenantId } }),
      this.prisma.insuranceClaim.count({
        where: { tenantId, status: ClaimStatus.INITIATED },
      }),
      this.prisma.insuranceClaim.count({
        where: { tenantId, status: ClaimStatus.UNDER_REVIEW },
      }),
      this.prisma.insuranceClaim.count({
        where: { tenantId, status: ClaimStatus.APPROVED },
      }),
      this.prisma.insuranceClaim.count({
        where: { tenantId, status: ClaimStatus.REJECTED },
      }),
    ]);

    const totalApprovedAmount = await this.prisma.insuranceClaim.aggregate({
      where: { tenantId, status: ClaimStatus.APPROVED },
      _sum: { coveredAmount: true },
    });

    return {
      total,
      initiated,
      underReview,
      approved,
      rejected,
      totalApprovedAmount: totalApprovedAmount._sum.coveredAmount || 0,
    };
  }
}
