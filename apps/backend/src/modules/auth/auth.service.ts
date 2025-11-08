import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { LoginDto, RegisterDto } from './dto/auth.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    // Auto-generate subdomain from tenant name
    const subdomain = dto.tenantName
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');

    // Check if tenant with subdomain already exists
    const existingTenant = await this.prisma.tenant.findUnique({
      where: { subdomain },
    });

    if (existingTenant) {
      throw new ConflictException('Hospital name already taken. Please choose a different name.');
    }

    // Check if user email already exists
    const existingEmail = await this.prisma.user.findFirst({
      where: { email: dto.email },
    });

    if (existingEmail) {
      throw new ConflictException('Email already registered');
    }

    // Create tenant first
    const tenant = await this.prisma.tenant.create({
      data: {
        name: dto.tenantName,
        subdomain,
        email: dto.tenantEmail,
        phone: dto.tenantPhone,
        isActive: true,
      },
    });

    // Hash password
    const hashedPassword = await bcrypt.hash(dto.password, 10);

    // Create admin user
    const user = await this.prisma.user.create({
      data: {
        tenantId: tenant.id,
        email: dto.email,
        password: hashedPassword,
        role: dto.role,
        firstName: dto.firstName,
        lastName: dto.lastName,
        phone: dto.phone,
        isActive: true,
      },
      include: {
        tenant: true,
      },
    });

    // Generate tokens
    const token = this.generateToken(user);
    const refreshToken = this.generateRefreshToken(user);

    return {
      user: this.sanitizeUser(user),
      token,
      refreshToken,
      tenant: {
        id: tenant.id,
        name: tenant.name,
        subdomain: tenant.subdomain,
      },
    };
  }

  private generateRefreshToken(user: any) {
    const payload = {
      sub: user.id,
      email: user.email,
      tenantId: user.tenantId,
      role: user.role,
      type: 'refresh',
    };

    return this.jwtService.sign(payload, { expiresIn: '7d' });
  }

  async login(dto: LoginDto) {
    try {
      // Find user by email only (email should be unique across all tenants)
      const user = await this.prisma.user.findFirst({
        where: {
          email: dto.email,
        },
        include: {
          tenant: true,
          staff: true,
        },
      });

      if (!user) {
        throw new UnauthorizedException('Invalid credentials');
      }

      const isPasswordValid = await bcrypt.compare(dto.password, user.password);

      if (!isPasswordValid) {
        throw new UnauthorizedException('Invalid credentials');
      }

      if (!user.isActive) {
        throw new UnauthorizedException('Account is deactivated');
      }

      await this.prisma.user.update({
        where: { id: user.id },
        data: { lastLogin: new Date() },
      });

      // Generate tokens
      const token = this.generateToken(user);
      const refreshToken = this.generateRefreshToken(user);

      return {
        user: this.sanitizeUser(user),
        token,
        refreshToken,
        tenant: {
          id: user.tenant.id,
          name: user.tenant.name,
          subdomain: user.tenant.subdomain,
        },
      };
    } catch (error) {
      console.error('Login error:', error);
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new Error(`Login failed: ${error.message}`);
    }
  }

  async validateUser(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        tenant: true,
      },
    });

    if (!user || !user.isActive) {
      return null;
    }

    return this.sanitizeUser(user);
  }

  private generateToken(user: any) {
    const payload = {
      sub: user.id,
      email: user.email,
      tenantId: user.tenantId,
      role: user.role,
      staffId: user.staff?.id || null,
    };

    return this.jwtService.sign(payload);
  }

  private sanitizeUser(user: any) {
    const { password, ...sanitized } = user;
    return sanitized;
  }
}
