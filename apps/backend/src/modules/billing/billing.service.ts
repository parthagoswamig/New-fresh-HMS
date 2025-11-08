import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateBillingDto } from './dto/create-billing.dto';
import { UpdateBillingDto } from './dto/update-billing.dto';
import { AddPaymentDto } from './dto/add-payment.dto';

@Injectable()
export class BillingService {
  constructor(private prisma: PrismaService) {}

  async create(tenantId: string, dto: CreateBillingDto) {
    // Generate bill number
    const count = await this.prisma.bill.count({ where: { tenantId } });
    const billNumber = `INV${String(count + 1).padStart(6, '0')}`;

    // Calculate total amount with item-level discounts
    const itemsTotal = dto.items.reduce((sum, item) => {
      const itemSubtotal = item.quantity * item.unitPrice;
      const itemDiscount = item.discount || 0;
      return sum + (itemSubtotal - itemDiscount);
    }, 0);
    
    const totalAmount = itemsTotal - (dto.discountAmount || 0) - (dto.insuranceCovered || 0);

    return this.prisma.bill.create({
      data: {
        tenantId,
        patientId: dto.patientId,
        billNumber,
        totalAmount,
        discountAmount: dto.discountAmount || 0,
        insuranceCovered: dto.insuranceCovered || 0,
        dueDate: dto.dueDate ? new Date(dto.dueDate) : null,
        notes: dto.notes,
        status: dto.status as any || 'PENDING',
        items: {
          create: dto.items.map((item) => ({
            description: item.description,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            discount: item.discount || 0,
            amount: (item.quantity * item.unitPrice) - (item.discount || 0),
          })),
        },
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
        items: true,
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
        { billNumber: { contains: search, mode: 'insensitive' } },
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

    const [bills, total] = await Promise.all([
      this.prisma.bill.findMany({
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
          items: true,
        },
        orderBy: {
          billDate: 'desc',
        },
      }),
      this.prisma.bill.count({ where }),
    ]);

    return {
      data: bills,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(tenantId: string, id: string) {
    const bill = await this.prisma.bill.findFirst({
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
            address: true,
          },
        },
        items: true,
        payments: true,
      },
    });

    if (!bill) {
      throw new NotFoundException('Bill not found');
    }

    return bill;
  }

  async update(tenantId: string, id: string, dto: UpdateBillingDto) {
    await this.findOne(tenantId, id);

    const updateData: any = {};

    if (dto.patientId) updateData.patientId = dto.patientId;
    if (dto.dueDate !== undefined)
      updateData.dueDate = dto.dueDate ? new Date(dto.dueDate) : null;
    if (dto.notes !== undefined) updateData.notes = dto.notes;
    if (dto.status) updateData.status = dto.status;
    if (dto.discountAmount !== undefined) updateData.discountAmount = dto.discountAmount;

    // If items are being updated, recalculate total
    if (dto.items) {
      // Delete existing items
      await this.prisma.billItem.deleteMany({
        where: { billId: id },
      });

      // Calculate new total
      const subtotal = dto.items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
      updateData.totalAmount = subtotal - (dto.discountAmount || 0);

      // Create new items
      updateData.items = {
        create: dto.items.map((item) => ({
          description: item.description,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          amount: item.quantity * item.unitPrice,
        })),
      };
    }

    return this.prisma.bill.update({
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
        items: true,
      },
    });
  }

  async remove(tenantId: string, id: string) {
    await this.findOne(tenantId, id);

    await this.prisma.bill.delete({
      where: { id },
    });

    return { message: 'Bill deleted successfully' };
  }

  async getStats(tenantId: string) {
    const [total, pending, paid, partiallyPaid, cancelled, totalRevenue] = await Promise.all([
      this.prisma.bill.count({ where: { tenantId } }),
      this.prisma.bill.count({
        where: { tenantId, status: 'PENDING' },
      }),
      this.prisma.bill.count({
        where: { tenantId, status: 'PAID' },
      }),
      this.prisma.bill.count({
        where: { tenantId, status: 'PARTIALLY_PAID' },
      }),
      this.prisma.bill.count({
        where: { tenantId, status: 'CANCELLED' },
      }),
      this.prisma.bill.aggregate({
        where: { tenantId, status: 'PAID' },
        _sum: { totalAmount: true },
      }),
    ]);

    return {
      total,
      pending,
      paid,
      partiallyPaid,
      cancelled,
      totalRevenue: totalRevenue._sum.totalAmount || 0,
    };
  }

  async addPayment(tenantId: string, billId: string, dto: AddPaymentDto) {
    // Verify bill exists and belongs to tenant
    const bill = await this.findOne(tenantId, billId);

    if (bill.finalized === false) {
      throw new BadRequestException('Cannot add payment to non-finalized bill');
    }

    const outstandingAmount = bill.totalAmount - bill.paidAmount;

    if (dto.amount > outstandingAmount) {
      throw new BadRequestException(`Payment amount (${dto.amount}) exceeds outstanding balance (${outstandingAmount})`);
    }

    // Create payment record
    const payment = await this.prisma.payment.create({
      data: {
        billId,
        amount: dto.amount,
        paymentMethod: dto.paymentMethod as any,
        transactionId: dto.transactionId,
        notes: dto.notes,
      },
    });

    // Update bill paid amount and status
    const newPaidAmount = bill.paidAmount + dto.amount;
    const newStatus = newPaidAmount >= bill.totalAmount ? 'PAID' : 'PARTIALLY_PAID';

    const updatedBill = await this.prisma.bill.update({
      where: { id: billId },
      data: {
        paidAmount: newPaidAmount,
        status: newStatus as any,
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
            address: true,
          },
        },
        items: true,
        payments: {
          orderBy: { paymentDate: 'desc' },
        },
      },
    });

    return updatedBill;
  }

  async finalizeBill(tenantId: string, billId: string) {
    // Verify bill exists and belongs to tenant
    const bill = await this.findOne(tenantId, billId);

    if (bill.finalized) {
      throw new BadRequestException('Bill is already finalized');
    }

    return this.prisma.bill.update({
      where: { id: billId },
      data: { finalized: true },
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
            address: true,
          },
        },
        items: true,
        payments: {
          orderBy: { paymentDate: 'desc' },
        },
      },
    });
  }
}
