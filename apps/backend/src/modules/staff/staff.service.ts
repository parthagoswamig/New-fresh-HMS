import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateStaffDto, UpdateStaffDto } from './dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class StaffService {
  constructor(private prisma: PrismaService) {}

  async create(tenantId: string, dto: CreateStaffDto) {
    // Check if email already exists for this tenant
    const existingUser = await this.prisma.user.findFirst({
      where: {
        tenantId,
        email: dto.email,
      },
    });

    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    // Check if employee ID already exists for this tenant
    const existingStaff = await this.prisma.staff.findFirst({
      where: {
        tenantId,
        employeeId: dto.employeeId,
      },
    });

    if (existingStaff) {
      throw new ConflictException('Employee ID already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(dto.password, 12);

    // Create user and staff in a transaction
    const staff = await this.prisma.$transaction(async (prisma) => {
      // Create user
      const user = await prisma.user.create({
        data: {
          tenantId,
          email: dto.email,
          password: hashedPassword,
          role: dto.role,
          firstName: dto.firstName,
          lastName: dto.lastName,
          phone: dto.phone,
          isActive: dto.isActive ?? true,
        },
      });

      // Create staff
      const newStaff = await prisma.staff.create({
        data: {
          tenantId,
          userId: user.id,
          employeeId: dto.employeeId,
          departmentId: dto.departmentId,
          specialization: dto.specialization,
          qualification: dto.qualification,
          experience: dto.experience,
          dateOfJoining: new Date(dto.dateOfJoining),
          dateOfBirth: dto.dateOfBirth ? new Date(dto.dateOfBirth) : null,
          gender: dto.gender,
          address: dto.address,
          emergencyContact: dto.emergencyContact,
          salary: dto.salary,
          isActive: dto.isActive ?? true,
        },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
              phone: true,
              role: true,
              isActive: true,
            },
          },
          department: true,
        },
      });

      return newStaff;
    });

    return staff;
  }

  async findAll(
    tenantId: string,
    page: number = 1,
    limit: number = 10,
    search?: string,
    departmentId?: string,
    role?: string,
    isActive?: boolean,
  ) {
    const skip = (page - 1) * limit;

    const where: any = {
      tenantId,
    };

    if (search) {
      where.OR = [
        { user: { firstName: { contains: search, mode: 'insensitive' } } },
        { user: { lastName: { contains: search, mode: 'insensitive' } } },
        { user: { email: { contains: search, mode: 'insensitive' } } },
        { employeeId: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (departmentId) {
      where.departmentId = departmentId;
    }

    if (role) {
      where.user = { ...where.user, role };
    }

    if (isActive !== undefined) {
      where.isActive = isActive;
    }

    const [staff, total] = await Promise.all([
      this.prisma.staff.findMany({
        where,
        skip,
        take: limit,
        include: {
          user: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
              phone: true,
              role: true,
              isActive: true,
              lastLogin: true,
            },
          },
          department: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      }),
      this.prisma.staff.count({ where }),
    ]);

    return {
      data: staff,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(tenantId: string, id: string) {
    const staff = await this.prisma.staff.findFirst({
      where: {
        id,
        tenantId,
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            phone: true,
            role: true,
            isActive: true,
            lastLogin: true,
            createdAt: true,
          },
        },
        department: true,
      },
    });

    if (!staff) {
      throw new NotFoundException('Staff not found');
    }

    return staff;
  }

  async update(tenantId: string, id: string, dto: UpdateStaffDto) {
    const staff = await this.findOne(tenantId, id);

    // Check if email is being updated and already exists
    if (dto.email && dto.email !== staff.user.email) {
      const existingUser = await this.prisma.user.findFirst({
        where: {
          tenantId,
          email: dto.email,
          id: { not: staff.userId },
        },
      });

      if (existingUser) {
        throw new ConflictException('Email already exists');
      }
    }

    // Check if employee ID is being updated and already exists
    if (dto.employeeId && dto.employeeId !== staff.employeeId) {
      const existingStaff = await this.prisma.staff.findFirst({
        where: {
          tenantId,
          employeeId: dto.employeeId,
          id: { not: id },
        },
      });

      if (existingStaff) {
        throw new ConflictException('Employee ID already exists');
      }
    }

    // Update in transaction
    const updatedStaff = await this.prisma.$transaction(async (prisma) => {
      // Update user data
      const userData: any = {};
      if (dto.email) userData.email = dto.email;
      if (dto.firstName) userData.firstName = dto.firstName;
      if (dto.lastName) userData.lastName = dto.lastName;
      if (dto.phone !== undefined) userData.phone = dto.phone;
      if (dto.role) userData.role = dto.role;
      if (dto.isActive !== undefined) userData.isActive = dto.isActive;
      if (dto.password) {
        userData.password = await bcrypt.hash(dto.password, 12);
      }

      if (Object.keys(userData).length > 0) {
        await prisma.user.update({
          where: { id: staff.userId },
          data: userData,
        });
      }

      // Update staff data
      const staffData: any = {};
      if (dto.employeeId) staffData.employeeId = dto.employeeId;
      if (dto.departmentId !== undefined) staffData.departmentId = dto.departmentId;
      if (dto.specialization !== undefined) staffData.specialization = dto.specialization;
      if (dto.qualification !== undefined) staffData.qualification = dto.qualification;
      if (dto.experience !== undefined) staffData.experience = dto.experience;
      if (dto.dateOfJoining) staffData.dateOfJoining = new Date(dto.dateOfJoining);
      if (dto.dateOfBirth !== undefined) {
        staffData.dateOfBirth = dto.dateOfBirth ? new Date(dto.dateOfBirth) : null;
      }
      if (dto.gender !== undefined) staffData.gender = dto.gender;
      if (dto.address !== undefined) staffData.address = dto.address;
      if (dto.emergencyContact !== undefined) staffData.emergencyContact = dto.emergencyContact;
      if (dto.salary !== undefined) staffData.salary = dto.salary;
      if (dto.isActive !== undefined) staffData.isActive = dto.isActive;

      const updated = await prisma.staff.update({
        where: { id },
        data: staffData,
        include: {
          user: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
              phone: true,
              role: true,
              isActive: true,
            },
          },
          department: true,
        },
      });

      return updated;
    });

    return updatedStaff;
  }

  async remove(tenantId: string, id: string) {
    const staff = await this.findOne(tenantId, id);

    // Soft delete - set isActive to false
    await this.prisma.$transaction([
      this.prisma.staff.update({
        where: { id },
        data: { isActive: false },
      }),
      this.prisma.user.update({
        where: { id: staff.userId },
        data: { isActive: false },
      }),
    ]);

    return { message: 'Staff deactivated successfully' };
  }

  async getStats(tenantId: string) {
    const [total, active, byRole, byDepartment] = await Promise.all([
      this.prisma.staff.count({ where: { tenantId } }),
      this.prisma.staff.count({ where: { tenantId, isActive: true } }),
      this.prisma.staff.groupBy({
        by: ['user'],
        where: { tenantId },
        _count: true,
      }),
      this.prisma.staff.groupBy({
        by: ['departmentId'],
        where: { tenantId, departmentId: { not: null } },
        _count: true,
      }),
    ]);

    return {
      total,
      active,
      inactive: total - active,
      byRole,
      byDepartment,
    };
  }
}
