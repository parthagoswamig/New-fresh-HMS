import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreatePolicyDto } from './dto/create-policy.dto';
import { UpdatePolicyDto } from './dto/update-policy.dto';

@Injectable()
export class InsurancePolicyService {
  constructor(private prisma: PrismaService) {}

  async create(tenantId: string, dto: CreatePolicyDto) {
    // Check if policy number already exists
    const existing = await this.prisma.insurancePolicy.findUnique({
      where: {
        tenantId_policyNumber: {
          tenantId,
          policyNumber: dto.policyNumber,
        },
      },
    });

    if (existing) {
      throw new BadRequestException(
        `Policy with number "${dto.policyNumber}" already exists`
      );
    }

    // Verify company exists
    const company = await this.prisma.insuranceCompany.findFirst({
      where: { id: dto.companyId, tenantId, isActive: true },
    });

    if (!company) {
      throw new NotFoundException('Insurance company not found');
    }

    // Validate dates
    const validFrom = new Date(dto.validFrom);
    const validUntil = new Date(dto.validUntil);

    if (validFrom >= validUntil) {
      throw new BadRequestException('Valid from date must be before valid until date');
    }

    return this.prisma.insurancePolicy.create({
      data: {
        ...dto,
        tenantId,
        validFrom,
        validUntil,
      },
      include: {
        company: true,
      },
    });
  }

  async findAll(
    tenantId: string,
    page: number = 1,
    limit: number = 10,
    companyId?: string,
    search?: string,
  ) {
    const skip = (page - 1) * limit;

    const where: any = {
      tenantId,
      isActive: true,
    };

    if (companyId) {
      where.companyId = companyId;
    }

    if (search) {
      where.OR = [
        { policyName: { contains: search, mode: 'insensitive' } },
        { policyNumber: { contains: search, mode: 'insensitive' } },
        { policyType: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [policies, total] = await Promise.all([
      this.prisma.insurancePolicy.findMany({
        where,
        skip,
        take: limit,
        include: {
          company: true,
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.insurancePolicy.count({ where }),
    ]);

    return {
      data: policies,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(tenantId: string, id: string) {
    const policy = await this.prisma.insurancePolicy.findFirst({
      where: { id, tenantId, isActive: true },
      include: {
        company: true,
      },
    });

    if (!policy) {
      throw new NotFoundException('Insurance policy not found');
    }

    return policy;
  }

  async update(tenantId: string, id: string, dto: UpdatePolicyDto) {
    await this.findOne(tenantId, id);

    // Validate dates if provided
    if (dto.validFrom && dto.validUntil) {
      const validFrom = new Date(dto.validFrom);
      const validUntil = new Date(dto.validUntil);

      if (validFrom >= validUntil) {
        throw new BadRequestException('Valid from date must be before valid until date');
      }
    }

    const updateData: any = { ...dto };
    if (dto.validFrom) updateData.validFrom = new Date(dto.validFrom);
    if (dto.validUntil) updateData.validUntil = new Date(dto.validUntil);

    return this.prisma.insurancePolicy.update({
      where: { id },
      data: updateData,
      include: {
        company: true,
      },
    });
  }

  async remove(tenantId: string, id: string) {
    await this.findOne(tenantId, id);

    // Soft delete
    return this.prisma.insurancePolicy.update({
      where: { id },
      data: { isActive: false },
    });
  }

  async validatePolicy(tenantId: string, policyId: string): Promise<boolean> {
    const policy = await this.findOne(tenantId, policyId);
    const now = new Date();

    return (
      policy.isActive &&
      policy.validFrom <= now &&
      policy.validUntil >= now
    );
  }
}
