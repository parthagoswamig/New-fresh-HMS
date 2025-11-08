import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { TestStatus } from '@prisma/client';
import { CreateLabEntryDto } from './dto/create-lab-entry.dto';
import { AddLabResultsDto } from './dto/add-lab-results.dto';

@Injectable()
export class LabEntryService {
  constructor(private prisma: PrismaService) {}

  async createEntry(tenantId: string, userId: string, dto: CreateLabEntryDto) {
    // Fetch lab tests with prices
    const testIds = dto.tests.map(t => t.labTestId);
    const labTests = await this.prisma.labTest.findMany({
      where: {
        id: { in: testIds },
        tenantId,
        isActive: true,
      },
    });

    if (labTests.length !== testIds.length) {
      throw new BadRequestException('One or more lab tests not found or inactive');
    }

    // Calculate total amount from fetched prices
    const totalAmount = labTests.reduce((sum, test) => sum + test.price, 0);

    // Generate entry number
    const count = await this.prisma.labEntry.count({ where: { tenantId } });
    const entryNumber = `LAB${String(count + 1).padStart(6, '0')}`;

    // Create lab entry with items (auto-populate from lab tests)
    const labEntry = await this.prisma.labEntry.create({
      data: {
        tenantId,
        patientId: dto.patientId,
        entryNumber,
        totalAmount,
        sampleType: dto.sampleType,
        notes: dto.notes,
        createdById: userId,
        items: {
          create: labTests.map((test) => ({
            labTestId: test.id,
            testName: test.name,
            price: test.price,
            unit: test.unit,
            referenceRange: test.referenceRange,
            status: TestStatus.ORDERED,
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
            dateOfBirth: true,
            gender: true,
            bloodGroup: true,
            address: true,
          },
        },
        items: {
          include: {
            labTest: {
              select: {
                id: true,
                name: true,
                category: true,
                price: true,
              },
            },
          },
        },
        createdBy: {
          select: {
            id: true,
            user: {
              select: {
                firstName: true,
                lastName: true,
                email: true,
              },
            },
          },
        },
      },
    });

    // If billNow is true, create bill immediately
    if (dto.billNow) {
      await this.createBillForEntry(tenantId, labEntry.id);
    }

    return labEntry;
  }

  async findAll(
    tenantId: string,
    page: number = 1,
    limit: number = 10,
    search?: string,
    patientId?: string,
    status?: string,
  ) {
    const skip = (page - 1) * limit;

    const where: any = {
      tenantId,
    };

    if (search) {
      where.OR = [
        { entryNumber: { contains: search, mode: 'insensitive' } },
        { patient: { firstName: { contains: search, mode: 'insensitive' } } },
        { patient: { lastName: { contains: search, mode: 'insensitive' } } },
        { patient: { patientId: { contains: search, mode: 'insensitive' } } },
      ];
    }

    if (patientId) {
      where.patientId = patientId;
    }

    if (status) {
      // Convert string status to enum
      where.status = TestStatus[status as keyof typeof TestStatus];
    }

    const [entries, total] = await Promise.all([
      this.prisma.labEntry.findMany({
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
          items: {
            include: {
              labTest: {
                select: {
                  id: true,
                  name: true,
                  category: true,
                },
              },
            },
          },
          report: {
            select: {
              id: true,
              printed: true,
              reportedAt: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.labEntry.count({ where }),
    ]);

    return {
      data: entries,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(tenantId: string, id: string) {
    const entry = await this.prisma.labEntry.findFirst({
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
            dateOfBirth: true,
            gender: true,
            bloodGroup: true,
            address: true,
          },
        },
        items: {
          include: {
            labTest: {
              select: {
                id: true,
                name: true,
                category: true,
                price: true,
              },
            },
          },
        },
        report: {
          include: {
            reportedBy: {
              select: {
                id: true,
                user: {
                  select: {
                    firstName: true,
                    lastName: true,
                    email: true,
                  },
                },
              },
            },
          },
        },
        createdBy: {
          select: {
            id: true,
            user: {
              select: {
                firstName: true,
                lastName: true,
                email: true,
              },
            },
          },
        },
        bill: {
          select: {
            id: true,
            billNumber: true,
            status: true,
            totalAmount: true,
            paidAmount: true,
          },
        },
      },
    });

    if (!entry) {
      throw new NotFoundException('Lab entry not found');
    }

    return entry;
  }

  async addResults(tenantId: string, entryId: string, userId: string, dto: AddLabResultsDto) {
    // Verify entry exists and belongs to tenant
    const entry = await this.findOne(tenantId, entryId);

    if (entry.report) {
      throw new BadRequestException('Results already submitted for this entry');
    }

    // Update each test result
    for (const result of dto.results) {
      await this.prisma.labEntryItem.update({
        where: { id: result.itemId },
        data: {
          result: result.result,
          unit: result.unit,
          referenceRange: result.referenceRange,
          status: TestStatus.COMPLETED,
        },
      });
    }

    // Create lab report
    const report = await this.prisma.labReport.create({
      data: {
        labEntryId: entryId,
        findings: dto.findings,
        interpretation: dto.interpretation,
        comments: dto.comments,
        reportedById: userId,
      },
      include: {
        labEntry: {
          include: {
            patient: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                patientId: true,
                dateOfBirth: true,
                gender: true,
                bloodGroup: true,
              },
            },
            items: true,
          },
        },
        reportedBy: {
          select: {
            id: true,
            user: {
              select: {
                firstName: true,
                lastName: true,
                email: true,
              },
            },
          },
        },
      },
    });

    // Update entry status to COMPLETED
    await this.prisma.labEntry.update({
      where: { id: entryId },
      data: { status: TestStatus.COMPLETED },
    });

    return report;
  }

  async getPrintData(tenantId: string, entryId: string) {
    const entry = await this.findOne(tenantId, entryId);

    if (!entry.report) {
      throw new BadRequestException('No report available for this entry');
    }

    // Mark as printed
    await this.prisma.labReport.update({
      where: { id: entry.report.id },
      data: {
        printed: true,
        printedAt: new Date(),
      },
    });

    return entry;
  }

  async createBillForEntry(tenantId: string, entryId: string) {
    const entry = await this.findOne(tenantId, entryId);

    if (entry.billedToFinal) {
      throw new BadRequestException('Entry already billed');
    }

    // Generate bill number
    const billCount = await this.prisma.bill.count({ where: { tenantId } });
    const billNumber = `INV${String(billCount + 1).padStart(6, '0')}`;

    // Create bill
    const bill = await this.prisma.bill.create({
      data: {
        tenantId,
        patientId: entry.patientId,
        billNumber,
        totalAmount: entry.totalAmount,
        status: 'PENDING',
        items: {
          create: entry.items.map((item) => ({
            description: `Lab Test: ${item.testName}`,
            quantity: 1,
            unitPrice: item.price,
            amount: item.price,
          })),
        },
      },
    });

    // Update entry to mark as billed
    await this.prisma.labEntry.update({
      where: { id: entryId },
      data: {
        billedToFinal: true,
        billId: bill.id,
      },
    });

    return bill;
  }

  async getStats(tenantId: string) {
    const [total, ordered, inProgress, completed] = await Promise.all([
      this.prisma.labEntry.count({ where: { tenantId } }),
      this.prisma.labEntry.count({ where: { tenantId, status: TestStatus.ORDERED } }),
      this.prisma.labEntry.count({ where: { tenantId, status: TestStatus.IN_PROGRESS } }),
      this.prisma.labEntry.count({ where: { tenantId, status: TestStatus.COMPLETED } }),
    ]);

    return {
      total,
      ordered,
      inProgress,
      completed,
    };
  }

  async remove(tenantId: string, id: string) {
    await this.findOne(tenantId, id);

    await this.prisma.labEntry.delete({
      where: { id },
    });

    return { message: 'Lab entry deleted successfully' };
  }
}
