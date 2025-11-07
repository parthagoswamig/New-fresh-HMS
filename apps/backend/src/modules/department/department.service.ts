import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateDepartmentDto } from './dto/create-department.dto';
import { UpdateDepartmentDto } from './dto/update-department.dto';

@Injectable()
export class DepartmentService {
  constructor(private prisma: PrismaService) {}

  async create(tenantId: string, dto: CreateDepartmentDto) {
    // Check if department name already exists for this tenant
    const existing = await this.prisma.department.findFirst({
      where: {
        tenantId,
        name: dto.name,
      },
    });

    if (existing) {
      throw new ConflictException('Department name already exists');
    }

    return this.prisma.department.create({
      data: {
        tenantId,
        name: dto.name,
        description: dto.description,
        isActive: dto.isActive ?? true,
      },
    });
  }

  async findAll(tenantId: string, isActive?: boolean) {
    const where: any = { tenantId };
    
    if (isActive !== undefined) {
      where.isActive = isActive;
    }

    return {
      data: await this.prisma.department.findMany({
        where,
        orderBy: { name: 'asc' },
      }),
    };
  }

  async findOne(tenantId: string, id: string) {
    const department = await this.prisma.department.findFirst({
      where: { id, tenantId },
      include: {
        _count: {
          select: { staff: true },
        },
      },
    });

    if (!department) {
      throw new NotFoundException('Department not found');
    }

    return department;
  }

  async update(tenantId: string, id: string, dto: UpdateDepartmentDto) {
    await this.findOne(tenantId, id);

    if (dto.name) {
      const existing = await this.prisma.department.findFirst({
        where: {
          tenantId,
          name: dto.name,
          id: { not: id },
        },
      });

      if (existing) {
        throw new ConflictException('Department name already exists');
      }
    }

    return this.prisma.department.update({
      where: { id },
      data: dto,
    });
  }

  async remove(tenantId: string, id: string) {
    await this.findOne(tenantId, id);

    // Soft delete
    await this.prisma.department.update({
      where: { id },
      data: { isActive: false },
    });

    return { message: 'Department deactivated successfully' };
  }
}
