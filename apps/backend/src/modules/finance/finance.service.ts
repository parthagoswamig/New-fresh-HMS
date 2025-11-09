import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateTransactionDto, TransactionSourceEnum } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';

@Injectable()
export class FinanceService {
  constructor(private prisma: PrismaService) {}

  async create(tenantId: string, userId: string, dto: CreateTransactionDto) {
    // Generate transaction number
    const transactionNo = await this.generateTransactionNumber(tenantId);

    return this.prisma.financeTransaction.create({
      data: {
        tenantId,
        transactionNo,
        type: dto.type as any,
        amount: dto.amount,
        sourceModule: dto.sourceModule as any,
        sourceReference: dto.sourceReference,
        reason: dto.reason,
        description: dto.description,
        paymentMethod: dto.paymentMethod as any,
        category: dto.category as any,
        tags: dto.tags || [],
        date: dto.date ? new Date(dto.date) : new Date(),
        attachments: dto.attachments as any,
        metadata: dto.metadata as any,
        patientId: dto.patientId,
        staffId: dto.staffId,
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
        staff: {
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

  private async generateTransactionNumber(tenantId: string): Promise<string> {
    const count = await this.prisma.financeTransaction.count({
      where: { tenantId },
    });

    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const sequence = String(count + 1).padStart(4, '0');

    return `FIN-${year}${month}-${sequence}`;
  }

  async findAll(
    tenantId: string,
    page: number = 1,
    limit: number = 10,
    search?: string,
    type?: string,
    sourceModule?: string,
    category?: string,
    startDate?: string,
    endDate?: string,
  ) {
    const skip = (page - 1) * limit;

    const where: any = { tenantId };

    if (search) {
      where.OR = [
        { transactionNo: { contains: search, mode: 'insensitive' } },
        { reason: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (type) {
      where.type = type;
    }

    if (sourceModule) {
      where.sourceModule = sourceModule;
    }

    if (category) {
      where.category = category;
    }

    if (startDate || endDate) {
      where.date = {};
      if (startDate) {
        where.date.gte = new Date(startDate);
      }
      if (endDate) {
        where.date.lte = new Date(endDate);
      }
    }

    const [transactions, total] = await Promise.all([
      this.prisma.financeTransaction.findMany({
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
          staff: {
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
        orderBy: { date: 'desc' },
      }),
      this.prisma.financeTransaction.count({ where }),
    ]);

    return {
      data: transactions,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(tenantId: string, id: string) {
    const transaction = await this.prisma.financeTransaction.findFirst({
      where: { id, tenantId },
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
        staff: {
          select: {
            id: true,
            employeeId: true,
            user: {
              select: {
                firstName: true,
                lastName: true,
                email: true,
              },
            },
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

    if (!transaction) {
      throw new NotFoundException('Transaction not found');
    }

    return transaction;
  }

  async update(tenantId: string, id: string, dto: UpdateTransactionDto) {
    const transaction = await this.findOne(tenantId, id);

    // Only allow updating manual transactions
    if (transaction.sourceModule !== 'MANUAL') {
      throw new BadRequestException('Cannot update auto-generated transactions');
    }

    return this.prisma.financeTransaction.update({
      where: { id },
      data: {
        type: dto.type as any,
        amount: dto.amount,
        reason: dto.reason,
        description: dto.description,
        paymentMethod: dto.paymentMethod as any,
        category: dto.category as any,
        tags: dto.tags,
        date: dto.date ? new Date(dto.date) : undefined,
        attachments: dto.attachments as any,
        metadata: dto.metadata as any,
        patientId: dto.patientId,
        staffId: dto.staffId,
      },
      include: {
        patient: true,
        staff: true,
        createdBy: true,
      },
    });
  }

  async remove(tenantId: string, id: string) {
    const transaction = await this.findOne(tenantId, id);

    // Only allow deleting manual transactions
    if (transaction.sourceModule !== 'MANUAL') {
      throw new BadRequestException('Cannot delete auto-generated transactions');
    }

    await this.prisma.financeTransaction.delete({
      where: { id },
    });

    return { message: 'Transaction deleted successfully' };
  }

  async getStats(tenantId: string, startDate?: string, endDate?: string) {
    const where: any = { tenantId };

    if (startDate || endDate) {
      where.date = {};
      if (startDate) {
        where.date.gte = new Date(startDate);
      }
      if (endDate) {
        where.date.lte = new Date(endDate);
      }
    }

    const [
      totalIncome,
      totalExpense,
      totalAdvance,
      incomeByCategory,
      expenseByCategory,
      transactionsBySource,
    ] = await Promise.all([
      this.prisma.financeTransaction.aggregate({
        where: { ...where, type: 'INCOME' },
        _sum: { amount: true },
        _count: true,
      }),
      this.prisma.financeTransaction.aggregate({
        where: { ...where, type: 'EXPENSE' },
        _sum: { amount: true },
        _count: true,
      }),
      this.prisma.financeTransaction.aggregate({
        where: { ...where, type: 'ADVANCE' },
        _sum: { amount: true },
        _count: true,
      }),
      this.prisma.financeTransaction.groupBy({
        by: ['category'],
        where: { ...where, type: 'INCOME' },
        _sum: { amount: true },
        _count: true,
      }),
      this.prisma.financeTransaction.groupBy({
        by: ['category'],
        where: { ...where, type: 'EXPENSE' },
        _sum: { amount: true },
        _count: true,
      }),
      this.prisma.financeTransaction.groupBy({
        by: ['sourceModule'],
        where,
        _sum: { amount: true },
        _count: true,
      }),
    ]);

    const income = totalIncome._sum.amount || 0;
    const expense = totalExpense._sum.amount || 0;
    const advance = totalAdvance._sum.amount || 0;
    const netProfit = income - expense;

    return {
      totalIncome: income,
      totalExpense: expense,
      totalAdvance: advance,
      netProfit,
      incomeCount: totalIncome._count,
      expenseCount: totalExpense._count,
      advanceCount: totalAdvance._count,
      incomeByCategory: incomeByCategory.map((item) => ({
        category: item.category,
        amount: item._sum.amount || 0,
        count: item._count,
      })),
      expenseByCategory: expenseByCategory.map((item) => ({
        category: item.category,
        amount: item._sum.amount || 0,
        count: item._count,
      })),
      transactionsBySource: transactionsBySource.map((item) => ({
        source: item.sourceModule,
        amount: item._sum.amount || 0,
        count: item._count,
      })),
    };
  }

  // ==================== AUTO-TRACKING METHODS ====================

  /**
   * Auto-create transaction from billing payment
   */
  async trackBillingPayment(
    tenantId: string,
    billId: string,
    amount: number,
    paymentMethod: string,
    patientId: string,
  ) {
    const transactionNo = await this.generateTransactionNumber(tenantId);

    return this.prisma.financeTransaction.create({
      data: {
        tenantId,
        transactionNo,
        type: 'INCOME',
        amount,
        sourceModule: 'BILLING',
        sourceReference: billId,
        reason: 'Invoice Payment',
        description: `Payment received for invoice ${billId}`,
        paymentMethod: paymentMethod as any,
        category: 'CONSULTATION_FEE',
        patientId,
        createdById: 'system', // Will be updated with actual staff ID
        metadata: { billId } as any,
      },
    });
  }

  /**
   * Auto-create transaction from IPD advance
   */
  async trackIPDAdvance(
    tenantId: string,
    admissionId: string,
    amount: number,
    paymentMethod: string,
    patientId: string,
  ) {
    const transactionNo = await this.generateTransactionNumber(tenantId);

    return this.prisma.financeTransaction.create({
      data: {
        tenantId,
        transactionNo,
        type: 'ADVANCE',
        amount,
        sourceModule: 'IPD',
        sourceReference: admissionId,
        reason: 'IPD Advance Payment',
        description: `Advance collected for IPD admission ${admissionId}`,
        paymentMethod: paymentMethod as any,
        category: 'ROOM_CHARGES',
        patientId,
        createdById: 'system',
        metadata: { admissionId } as any,
      },
    });
  }

  /**
   * Auto-create transaction from insurance claim reimbursement
   */
  async trackInsuranceReimbursement(
    tenantId: string,
    claimId: string,
    amount: number,
    patientId: string,
  ) {
    const transactionNo = await this.generateTransactionNumber(tenantId);

    return this.prisma.financeTransaction.create({
      data: {
        tenantId,
        transactionNo,
        type: 'INCOME',
        amount,
        sourceModule: 'INSURANCE',
        sourceReference: claimId,
        reason: 'Insurance Claim Reimbursement',
        description: `Insurance reimbursement for claim ${claimId}`,
        paymentMethod: 'INSURANCE',
        category: 'INSURANCE_REIMBURSEMENT',
        patientId,
        createdById: 'system',
        metadata: { claimId } as any,
      },
    });
  }

  /**
   * Auto-create transaction from pharmacy sales
   */
  async trackPharmacySale(
    tenantId: string,
    saleId: string,
    amount: number,
    paymentMethod: string,
    patientId?: string,
  ) {
    const transactionNo = await this.generateTransactionNumber(tenantId);

    return this.prisma.financeTransaction.create({
      data: {
        tenantId,
        transactionNo,
        type: 'INCOME',
        amount,
        sourceModule: 'PHARMACY',
        sourceReference: saleId,
        reason: 'Medicine Sales',
        description: `Medicine sale transaction ${saleId}`,
        paymentMethod: paymentMethod as any,
        category: 'MEDICINE_SALES',
        patientId,
        createdById: 'system',
        metadata: { saleId } as any,
      },
    });
  }

  /**
   * Auto-create transaction from lab test payment
   */
  async trackLabPayment(
    tenantId: string,
    labEntryId: string,
    amount: number,
    paymentMethod: string,
    patientId: string,
  ) {
    const transactionNo = await this.generateTransactionNumber(tenantId);

    return this.prisma.financeTransaction.create({
      data: {
        tenantId,
        transactionNo,
        type: 'INCOME',
        amount,
        sourceModule: 'LABORATORY',
        sourceReference: labEntryId,
        reason: 'Laboratory Test Payment',
        description: `Lab test payment for entry ${labEntryId}`,
        paymentMethod: paymentMethod as any,
        category: 'LAB_TEST',
        patientId,
        createdById: 'system',
        metadata: { labEntryId } as any,
      },
    });
  }

  /**
   * Auto-create transaction from salary payment
   */
  async trackSalaryPayment(
    tenantId: string,
    salaryId: string,
    amount: number,
    staffId: string,
  ) {
    const transactionNo = await this.generateTransactionNumber(tenantId);

    return this.prisma.financeTransaction.create({
      data: {
        tenantId,
        transactionNo,
        type: 'EXPENSE',
        amount,
        sourceModule: 'PAYROLL',
        sourceReference: salaryId,
        reason: 'Salary Payment',
        description: `Salary paid for ${salaryId}`,
        paymentMethod: 'BANK_TRANSFER',
        category: 'SALARY',
        staffId,
        createdById: 'system',
        metadata: { salaryId } as any,
      },
    });
  }
}
