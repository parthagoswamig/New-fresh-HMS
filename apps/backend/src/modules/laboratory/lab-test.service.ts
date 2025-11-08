import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateLabTestMasterDto } from './dto/create-lab-test-master.dto';
import { UpdateLabTestMasterDto } from './dto/update-lab-test-master.dto';

@Injectable()
export class LabTestService {
  constructor(private prisma: PrismaService) {}

  async createTest(tenantId: string, dto: CreateLabTestMasterDto) {
    // Check if test with same name already exists
    const existing = await this.prisma.labTest.findFirst({
      where: {
        tenantId,
        name: dto.name,
      },
    });

    if (existing) {
      throw new ConflictException('Lab test with this name already exists');
    }

    return this.prisma.labTest.create({
      data: {
        tenantId,
        name: dto.name,
        category: dto.category,
        price: dto.price,
        description: dto.description,
        unit: dto.unit,
        referenceRange: dto.referenceRange,
      },
    });
  }

  async findAllTests(
    tenantId: string,
    page: number = 1,
    limit: number = 10,
    search?: string,
    category?: string,
    isActive?: boolean,
  ) {
    const skip = (page - 1) * limit;

    const where: any = {
      tenantId,
    };

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { category: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (category) {
      where.category = category;
    }

    if (isActive !== undefined) {
      where.isActive = isActive;
    }

    const [tests, total] = await Promise.all([
      this.prisma.labTest.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          name: 'asc',
        },
      }),
      this.prisma.labTest.count({ where }),
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

  async findOneTest(tenantId: string, id: string) {
    const test = await this.prisma.labTest.findFirst({
      where: {
        id,
        tenantId,
      },
    });

    if (!test) {
      throw new NotFoundException('Lab test not found');
    }

    return test;
  }

  async updateTest(tenantId: string, id: string, dto: UpdateLabTestMasterDto) {
    await this.findOneTest(tenantId, id);

    // If name is being updated, check for conflicts
    if (dto.name) {
      const existing = await this.prisma.labTest.findFirst({
        where: {
          tenantId,
          name: dto.name,
          NOT: { id },
        },
      });

      if (existing) {
        throw new ConflictException('Lab test with this name already exists');
      }
    }

    return this.prisma.labTest.update({
      where: { id },
      data: {
        name: dto.name,
        category: dto.category,
        price: dto.price,
        description: dto.description,
        unit: dto.unit,
        referenceRange: dto.referenceRange,
        isActive: dto.isActive,
      },
    });
  }

  async removeTest(tenantId: string, id: string) {
    await this.findOneTest(tenantId, id);

    // Soft delete by setting isActive to false
    await this.prisma.labTest.update({
      where: { id },
      data: { isActive: false },
    });

    return { message: 'Lab test deactivated successfully' };
  }

  async getCategories(tenantId: string) {
    const tests = await this.prisma.labTest.findMany({
      where: { tenantId, isActive: true },
      select: { category: true },
      distinct: ['category'],
    });

    return tests
      .map((t) => t.category)
      .filter((c) => c !== null && c !== undefined);
  }

  async getTestStats(tenantId: string) {
    const [total, active, inactive, categories] = await Promise.all([
      this.prisma.labTest.count({ where: { tenantId } }),
      this.prisma.labTest.count({ where: { tenantId, isActive: true } }),
      this.prisma.labTest.count({ where: { tenantId, isActive: false } }),
      this.getCategories(tenantId),
    ]);

    return {
      total,
      active,
      inactive,
      categoriesCount: categories.length,
    };
  }
}
