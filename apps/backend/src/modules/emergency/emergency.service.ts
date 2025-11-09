import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateEmergencyDto } from './dto/create-emergency.dto';
import { UpdateEmergencyDto, EmergencyStatus } from './dto/update-emergency.dto';

@Injectable()
export class EmergencyService {
  constructor(private prisma: PrismaService) {}

  /**
   * Generate emergency number: EMR-YYYYMM-0001
   */
  private async generateEmergencyNumber(tenantId: string): Promise<string> {
    const now = new Date();
    const yearMonth = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}`;
    const prefix = `EMR-${yearMonth}`;

    const lastEmergency = await this.prisma.emergencyCase.findFirst({
      where: {
        tenantId,
        emergencyNumber: {
          startsWith: prefix,
        },
      },
      orderBy: {
        emergencyNumber: 'desc',
      },
    });

    let sequence = 1;
    if (lastEmergency) {
      const lastSequence = parseInt(lastEmergency.emergencyNumber.split('-')[2]);
      sequence = lastSequence + 1;
    }

    return `${prefix}-${String(sequence).padStart(4, '0')}`;
  }

  /**
   * Create new emergency case
   */
  async create(tenantId: string, createDto: CreateEmergencyDto) {
    // Validate that either patientId or quick registration data is provided
    if (!createDto.patientId && !createDto.quickName) {
      throw new BadRequestException('Either patientId or quick registration data (quickName) is required');
    }

    const emergencyNumber = await this.generateEmergencyNumber(tenantId);

    const emergency = await this.prisma.emergencyCase.create({
      data: {
        ...createDto,
        emergencyNumber,
        tenantId,
        arrivalTime: createDto.arrivalTime ? new Date(createDto.arrivalTime) : new Date(),
        progressNotes: createDto.progressNotes || [],
        interventions: createDto.interventions || [],
        investigations: createDto.investigations || [],
        medications: createDto.medications || [],
      },
      include: {
        patient: true,
        firstResponder: {
          include: { user: true },
        },
        triageNurse: {
          include: { user: true },
        },
        attendingDoctor: {
          include: { user: true },
        },
        createdBy: {
          include: { user: true },
        },
      },
    });

    return emergency;
  }

  /**
   * Get all emergency cases with filters
   */
  async findAll(
    tenantId: string,
    page: number = 1,
    limit: number = 10,
    filters?: {
      search?: string;
      status?: EmergencyStatus;
      severity?: string;
      startDate?: string;
      endDate?: string;
    },
  ) {
    const skip = (page - 1) * limit;
    const where: any = { tenantId };

    if (filters?.search) {
      where.OR = [
        { emergencyNumber: { contains: filters.search, mode: 'insensitive' } },
        { quickName: { contains: filters.search, mode: 'insensitive' } },
        { chiefComplaint: { contains: filters.search, mode: 'insensitive' } },
        { patient: { firstName: { contains: filters.search, mode: 'insensitive' } } },
        { patient: { lastName: { contains: filters.search, mode: 'insensitive' } } },
      ];
    }

    if (filters?.status) {
      where.status = filters.status;
    }

    if (filters?.severity) {
      where.severity = filters.severity;
    }

    if (filters?.startDate || filters?.endDate) {
      where.arrivalTime = {};
      if (filters.startDate) {
        where.arrivalTime.gte = new Date(filters.startDate);
      }
      if (filters.endDate) {
        where.arrivalTime.lte = new Date(filters.endDate);
      }
    }

    const [cases, total] = await Promise.all([
      this.prisma.emergencyCase.findMany({
        where,
        skip,
        take: limit,
        orderBy: { arrivalTime: 'desc' },
        include: {
          patient: true,
          firstResponder: { include: { user: true } },
          triageNurse: { include: { user: true } },
          attendingDoctor: { include: { user: true } },
          bill: true,
        },
      }),
      this.prisma.emergencyCase.count({ where }),
    ]);

    return {
      data: cases,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get emergency case by ID
   */
  async findOne(tenantId: string, id: string) {
    const emergency = await this.prisma.emergencyCase.findFirst({
      where: { id, tenantId },
      include: {
        patient: true,
        firstResponder: { include: { user: true } },
        triageNurse: { include: { user: true } },
        attendingDoctor: { include: { user: true } },
        admittedToIpd: true,
        bill: { include: { items: true, payments: true } },
        createdBy: { include: { user: true } },
        updatedBy: { include: { user: true } },
      },
    });

    if (!emergency) {
      throw new NotFoundException('Emergency case not found');
    }

    return emergency;
  }

  /**
   * Update emergency case
   */
  async update(tenantId: string, id: string, updateDto: UpdateEmergencyDto) {
    const existing = await this.findOne(tenantId, id);

    // Prevent updates to discharged or deceased cases
    if (existing.status === 'DISCHARGED' || existing.status === 'DECEASED') {
      throw new BadRequestException('Cannot update discharged or deceased emergency cases');
    }

    // Auto-set treatment start time when status changes to UNDER_TREATMENT
    if (updateDto.status === 'UNDER_TREATMENT' && !existing.treatmentStartTime) {
      updateDto.treatmentStartTime = new Date().toISOString();
    }

    // Auto-set treatment end time when status changes to DISCHARGED/ADMITTED/TRANSFERRED
    if (
      (updateDto.status === 'DISCHARGED' || updateDto.status === 'ADMITTED' || updateDto.status === 'TRANSFERRED') &&
      !existing.treatmentEndTime
    ) {
      updateDto.treatmentEndTime = new Date().toISOString();
    }

    const updated = await this.prisma.emergencyCase.update({
      where: { id },
      data: {
        ...updateDto,
        treatmentStartTime: updateDto.treatmentStartTime ? new Date(updateDto.treatmentStartTime) : undefined,
        treatmentEndTime: updateDto.treatmentEndTime ? new Date(updateDto.treatmentEndTime) : undefined,
        dischargeTime: updateDto.dischargeTime ? new Date(updateDto.dischargeTime) : undefined,
        followUpDate: updateDto.followUpDate ? new Date(updateDto.followUpDate) : undefined,
        deathTime: updateDto.deathTime ? new Date(updateDto.deathTime) : undefined,
      },
      include: {
        patient: true,
        firstResponder: { include: { user: true } },
        triageNurse: { include: { user: true } },
        attendingDoctor: { include: { user: true } },
        bill: true,
      },
    });

    return updated;
  }

  /**
   * Transfer to IPD
   */
  async transferToIpd(tenantId: string, id: string, ipdAdmissionId: string, updatedById: string) {
    const emergency = await this.findOne(tenantId, id);

    if (emergency.status === 'ADMITTED') {
      throw new BadRequestException('Emergency case already admitted');
    }

    return this.update(tenantId, id, {
      status: EmergencyStatus.ADMITTED,
      admittedToIpdId: ipdAdmissionId,
      treatmentEndTime: new Date().toISOString(),
      updatedById,
    });
  }

  /**
   * Discharge emergency case
   */
  async discharge(
    tenantId: string,
    id: string,
    data: {
      dischargeSummary: string;
      dischargeAdvice?: string;
      followUpDate?: string;
      updatedById: string;
    },
  ) {
    const emergency = await this.findOne(tenantId, id);

    if (emergency.status === 'DISCHARGED') {
      throw new BadRequestException('Emergency case already discharged');
    }

    return this.update(tenantId, id, {
      status: EmergencyStatus.DISCHARGED,
      dischargeTime: new Date().toISOString(),
      dischargeSummary: data.dischargeSummary,
      dischargeAdvice: data.dischargeAdvice,
      followUpDate: data.followUpDate,
      treatmentEndTime: new Date().toISOString(),
      updatedById: data.updatedById,
    });
  }

  /**
   * Declare death
   */
  async declareDeath(
    tenantId: string,
    id: string,
    data: {
      causeOfDeath: string;
      deathTime?: string;
      deathCertificateUrl?: string;
      updatedById: string;
    },
  ) {
    const emergency = await this.findOne(tenantId, id);

    if (emergency.status === 'DECEASED') {
      throw new BadRequestException('Death already declared for this case');
    }

    return this.update(tenantId, id, {
      status: EmergencyStatus.DECEASED,
      deathTime: data.deathTime || new Date().toISOString(),
      causeOfDeath: data.causeOfDeath,
      deathCertificateUrl: data.deathCertificateUrl,
      treatmentEndTime: new Date().toISOString(),
      updatedById: data.updatedById,
    });
  }

  /**
   * Soft delete (only for waiting cases)
   */
  async remove(tenantId: string, id: string) {
    const emergency = await this.findOne(tenantId, id);

    if (emergency.status !== 'WAITING') {
      throw new BadRequestException('Can only delete cases in WAITING status');
    }

    await this.prisma.emergencyCase.delete({
      where: { id },
    });

    return { message: 'Emergency case deleted successfully' };
  }

  /**
   * Get emergency statistics
   */
  async getStats(tenantId: string, startDate?: string, endDate?: string) {
    const where: any = { tenantId };

    if (startDate || endDate) {
      where.arrivalTime = {};
      if (startDate) where.arrivalTime.gte = new Date(startDate);
      if (endDate) where.arrivalTime.lte = new Date(endDate);
    }

    const [
      total,
      waiting,
      underTreatment,
      admitted,
      transferred,
      discharged,
      deceased,
      bySeverity,
      byArrivalMode,
    ] = await Promise.all([
      this.prisma.emergencyCase.count({ where }),
      this.prisma.emergencyCase.count({ where: { ...where, status: 'WAITING' } }),
      this.prisma.emergencyCase.count({ where: { ...where, status: 'UNDER_TREATMENT' } }),
      this.prisma.emergencyCase.count({ where: { ...where, status: 'ADMITTED' } }),
      this.prisma.emergencyCase.count({ where: { ...where, status: 'TRANSFERRED' } }),
      this.prisma.emergencyCase.count({ where: { ...where, status: 'DISCHARGED' } }),
      this.prisma.emergencyCase.count({ where: { ...where, status: 'DECEASED' } }),
      this.prisma.emergencyCase.groupBy({
        by: ['severity'],
        where,
        _count: true,
      }),
      this.prisma.emergencyCase.groupBy({
        by: ['arrivalMode'],
        where,
        _count: true,
      }),
    ]);

    // Calculate average treatment time
    const completedCases = await this.prisma.emergencyCase.findMany({
      where: {
        ...where,
        treatmentStartTime: { not: null },
        treatmentEndTime: { not: null },
      },
      select: {
        treatmentStartTime: true,
        treatmentEndTime: true,
      },
    });

    let avgTreatmentTime = 0;
    if (completedCases.length > 0) {
      const totalTime = completedCases.reduce((sum, c) => {
        const duration = new Date(c.treatmentEndTime!).getTime() - new Date(c.treatmentStartTime!).getTime();
        return sum + duration;
      }, 0);
      avgTreatmentTime = Math.round(totalTime / completedCases.length / 60000); // Convert to minutes
    }

    return {
      total,
      waiting,
      underTreatment,
      admitted,
      transferred,
      discharged,
      deceased,
      mortalityRate: total > 0 ? ((deceased / total) * 100).toFixed(2) : '0.00',
      avgTreatmentTime, // in minutes
      bySeverity: bySeverity.map((s) => ({
        severity: s.severity,
        count: s._count,
      })),
      byArrivalMode: byArrivalMode.map((a) => ({
        mode: a.arrivalMode,
        count: a._count,
      })),
    };
  }
}
