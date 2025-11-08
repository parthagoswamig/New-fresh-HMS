import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';

@Injectable()
export class InsuranceCompanyService {
  constructor(private prisma: PrismaService) {}

  async create(tenantId: string, dto: CreateCompanyDto) {
    return this.prisma.insuranceCompany.create({
      data: {
        ...dto,
        tenantId,
      },
      include: {
        policies: true,
      },
    });
  }

  async findAll(
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
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [companies, total] = await Promise.all([
      this.prisma.insuranceCompany.findMany({
        where,
        skip,
        take: limit,
        include: {
          policies: {
            where: { isActive: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.insuranceCompany.count({ where }),
    ]);

    return {
      data: companies,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(tenantId: string, id: string) {
    const company = await this.prisma.insuranceCompany.findFirst({
      where: { id, tenantId, isActive: true },
      include: {
        policies: {
          where: { isActive: true },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!company) {
      throw new NotFoundException('Insurance company not found');
    }

    return company;
  }

  async update(tenantId: string, id: string, dto: UpdateCompanyDto) {
    await this.findOne(tenantId, id);

    return this.prisma.insuranceCompany.update({
      where: { id },
      data: dto,
      include: {
        policies: true,
      },
    });
  }

  async remove(tenantId: string, id: string) {
    await this.findOne(tenantId, id);

    // Soft delete
    return this.prisma.insuranceCompany.update({
      where: { id },
      data: { isActive: false },
    });
  }

  async getStats(tenantId: string) {
    const [totalCompanies, activePolicies] = await Promise.all([
      this.prisma.insuranceCompany.count({
        where: { tenantId, isActive: true },
      }),
      this.prisma.insurancePolicy.count({
        where: { tenantId, isActive: true },
      }),
    ]);

    return {
      totalCompanies,
      activePolicies,
    };
  }
}
