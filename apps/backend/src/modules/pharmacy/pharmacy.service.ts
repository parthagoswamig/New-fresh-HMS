import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreatePharmacyDto } from './dto/create-pharmacy.dto';
import { UpdatePharmacyDto } from './dto/update-pharmacy.dto';

@Injectable()
export class PharmacyService {
  constructor(private prisma: PrismaService) {}

  async create(tenantId: string, dto: CreatePharmacyDto) {
    // Check for duplicate medicine
    const existing = await this.prisma.medicine.findFirst({
      where: {
        tenantId,
        name: dto.name,
        batchNumber: dto.batchNumber || null,
      },
    });

    if (existing) {
      throw new ConflictException('Medicine with this name and batch number already exists');
    }

    return this.prisma.medicine.create({
      data: {
        tenantId,
        name: dto.name,
        brand: dto.brand,
        batchNumber: dto.batchNumber,
        expiryDate: dto.expiryDate ? new Date(dto.expiryDate) : null,
        quantity: dto.quantity,
        unit: dto.unit,
        pricePerUnit: dto.pricePerUnit,
        description: dto.description,
        genericName: dto.genericName,
        manufacturer: dto.manufacturer,
        category: dto.category,
        reorderLevel: dto.reorderLevel || 10,
      },
    });
  }

  async findAll(
    tenantId: string,
    page: number = 1,
    limit: number = 10,
    search?: string,
    category?: string,
    lowStock?: boolean,
  ) {
    const skip = (page - 1) * limit;

    const where: any = {
      tenantId,
      isActive: true,
    };

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { brand: { contains: search, mode: 'insensitive' } },
        { genericName: { contains: search, mode: 'insensitive' } },
        { batchNumber: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (category) {
      where.category = category;
    }

    if (lowStock) {
      where.quantity = { lte: this.prisma.medicine.fields.reorderLevel };
    }

    const [medicines, total] = await Promise.all([
      this.prisma.medicine.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          createdAt: 'desc',
        },
      }),
      this.prisma.medicine.count({ where }),
    ]);

    return {
      data: medicines,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(tenantId: string, id: string) {
    const medicine = await this.prisma.medicine.findFirst({
      where: {
        id,
        tenantId,
      },
    });

    if (!medicine) {
      throw new NotFoundException('Medicine not found');
    }

    return medicine;
  }

  async update(tenantId: string, id: string, dto: UpdatePharmacyDto) {
    await this.findOne(tenantId, id);

    // Check for duplicate if name or batch number is being updated
    if (dto.name || dto.batchNumber !== undefined) {
      const existing = await this.prisma.medicine.findFirst({
        where: {
          tenantId,
          name: dto.name,
          batchNumber: dto.batchNumber || null,
          NOT: { id },
        },
      });

      if (existing) {
        throw new ConflictException('Medicine with this name and batch number already exists');
      }
    }

    const updateData: any = {};

    if (dto.name) updateData.name = dto.name;
    if (dto.brand !== undefined) updateData.brand = dto.brand;
    if (dto.batchNumber !== undefined) updateData.batchNumber = dto.batchNumber;
    if (dto.expiryDate !== undefined)
      updateData.expiryDate = dto.expiryDate ? new Date(dto.expiryDate) : null;
    if (dto.quantity !== undefined) updateData.quantity = dto.quantity;
    if (dto.unit) updateData.unit = dto.unit;
    if (dto.pricePerUnit !== undefined) updateData.pricePerUnit = dto.pricePerUnit;
    if (dto.description !== undefined) updateData.description = dto.description;
    if (dto.genericName !== undefined) updateData.genericName = dto.genericName;
    if (dto.manufacturer !== undefined) updateData.manufacturer = dto.manufacturer;
    if (dto.category !== undefined) updateData.category = dto.category;
    if (dto.reorderLevel !== undefined) updateData.reorderLevel = dto.reorderLevel;

    return this.prisma.medicine.update({
      where: { id },
      data: updateData,
    });
  }

  async remove(tenantId: string, id: string) {
    await this.findOne(tenantId, id);

    // Soft delete
    await this.prisma.medicine.update({
      where: { id },
      data: { isActive: false },
    });

    return { message: 'Medicine deleted successfully' };
  }

  async getStats(tenantId: string) {
    const [total, lowStock, expired, categories] = await Promise.all([
      this.prisma.medicine.count({ where: { tenantId, isActive: true } }),
      this.prisma.medicine.count({
        where: {
          tenantId,
          isActive: true,
          quantity: { lte: 10 },
        },
      }),
      this.prisma.medicine.count({
        where: {
          tenantId,
          isActive: true,
          expiryDate: { lte: new Date() },
        },
      }),
      this.prisma.medicine.groupBy({
        by: ['category'],
        where: { tenantId, isActive: true },
        _count: true,
      }),
    ]);

    return {
      total,
      lowStock,
      expired,
      categories: categories.length,
    };
  }
}
