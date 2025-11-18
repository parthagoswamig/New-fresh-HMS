import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreatePatientDto } from './dto/create-patient.dto';
import { UpdatePatientDto } from './dto/update-patient.dto';

@Injectable()
export class PatientService {
  constructor(private prisma: PrismaService) {}

  async create(tenantId: string, dto: CreatePatientDto) {
    // Check for duplicate email
    if (dto.email) {
      const existing = await this.prisma.patient.findFirst({
        where: {
          tenantId,
          email: dto.email,
        },
      });

      if (existing) {
        throw new ConflictException('Patient with this email already exists');
      }
    }

    // Check for duplicate Aadhaar within tenant (if provided)
    if (dto.aadhaarNumber) {
      const existingAadhaar = await this.prisma.patient.findFirst({
        where: {
          tenantId,
          aadhaarNumber: dto.aadhaarNumber,
        },
      });

      if (existingAadhaar) {
        throw new ConflictException('Patient with this Aadhaar number already exists');
      }
    }

    // Generate patient ID
    const count = await this.prisma.patient.count({ where: { tenantId } });
    const patientId = `PAT${String(count + 1).padStart(5, '0')}`;

    return this.prisma.patient.create({
      data: {
        tenantId,
        patientId,
        firstName: dto.firstName,
        lastName: dto.lastName,
        dateOfBirth: new Date(dto.dateOfBirth),
        gender: dto.gender as any,
        phone: dto.phone,
        aadhaarNumber: dto.aadhaarNumber,
        email: dto.email,
        address: dto.address,
        city: dto.city,
        state: dto.state,
        zipCode: dto.zipCode,
        bloodGroup: dto.bloodGroup,
        maritalStatus: dto.maritalStatus,
        emergencyContact: dto.emergencyContact,
        allergies: dto.allergies,
        supportingDocuments: (dto as any).supportingDocuments ?? undefined,
      },
    });
  }

  async findAll(
    tenantId: string,
    page: number = 1,
    limit: number = 10,
    search?: string,
    status?: string,
  ) {
    const skip = (page - 1) * limit;

    const where: any = {
      tenantId,
    };

    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { patientId: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } },
        { aadhaarNumber: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (status) {
      where.status = status;
    }

    const [patients, total] = await Promise.all([
      this.prisma.patient.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          createdAt: 'desc',
        },
      }),
      this.prisma.patient.count({ where }),
    ]);

    return {
      data: patients,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(tenantId: string, id: string) {
    const patient = await this.prisma.patient.findFirst({
      where: {
        id,
        tenantId,
      },
      include: {
        appointments: {
          take: 5,
          orderBy: { appointmentDate: 'desc' },
          include: {
            doctor: {
              include: {
                user: {
                  select: {
                    firstName: true,
                    lastName: true,
                  },
                },
              },
            },
          },
        },
        opdVisits: {
          take: 5,
          orderBy: { visitDate: 'desc' },
        },
        ipdAdmissions: {
          take: 5,
          orderBy: { admissionDate: 'desc' },
        },
      },
    });

    if (!patient) {
      throw new NotFoundException('Patient not found');
    }

    return patient;
  }

  async update(tenantId: string, id: string, dto: UpdatePatientDto) {
    await this.findOne(tenantId, id);

    // Check for duplicate email if being updated
    if (dto.email) {
      const existing = await this.prisma.patient.findFirst({
        where: {
          tenantId,
          email: dto.email,
          NOT: { id },
        },
      });

      if (existing) {
        throw new ConflictException('Patient with this email already exists');
      }
    }

    const updateData: any = {};

    if (dto.firstName) updateData.firstName = dto.firstName;
    if (dto.lastName) updateData.lastName = dto.lastName;
    if (dto.dateOfBirth) updateData.dateOfBirth = new Date(dto.dateOfBirth);
    if (dto.gender) updateData.gender = dto.gender;
    if (dto.phone) updateData.phone = dto.phone;
    if (dto.aadhaarNumber !== undefined) updateData.aadhaarNumber = dto.aadhaarNumber;
    if (dto.email !== undefined) updateData.email = dto.email;
    if (dto.address !== undefined) updateData.address = dto.address;
    if (dto.city !== undefined) updateData.city = dto.city;
    if (dto.state !== undefined) updateData.state = dto.state;
    if (dto.zipCode !== undefined) updateData.zipCode = dto.zipCode;
    if (dto.bloodGroup !== undefined) updateData.bloodGroup = dto.bloodGroup;
    if (dto.maritalStatus !== undefined) updateData.maritalStatus = dto.maritalStatus;
    if (dto.emergencyContact !== undefined) updateData.emergencyContact = dto.emergencyContact;
    if (dto.allergies !== undefined) updateData.allergies = dto.allergies;
    if ((dto as any).supportingDocuments !== undefined) {
      updateData.supportingDocuments = (dto as any).supportingDocuments;
    }

    return this.prisma.patient.update({
      where: { id },
      data: updateData,
    });
  }

  async remove(tenantId: string, id: string) {
    await this.findOne(tenantId, id);

    // Soft delete
    await this.prisma.patient.update({
      where: { id },
      data: { status: 'INACTIVE' },
    });

    return { message: 'Patient deleted successfully' };
  }

  async getStats(tenantId: string) {
    const [total, active, inactive, male, female] = await Promise.all([
      this.prisma.patient.count({ where: { tenantId } }),
      this.prisma.patient.count({
        where: { tenantId, status: 'ACTIVE' },
      }),
      this.prisma.patient.count({
        where: { tenantId, status: 'INACTIVE' },
      }),
      this.prisma.patient.count({
        where: { tenantId, gender: 'MALE' },
      }),
      this.prisma.patient.count({
        where: { tenantId, gender: 'FEMALE' },
      }),
    ]);

    return {
      total,
      active,
      inactive,
      male,
      female,
    };
  }
}
