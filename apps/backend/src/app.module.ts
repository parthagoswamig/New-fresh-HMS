import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AppController } from './app.controller';
import { AuthModule } from './modules/auth/auth.module';
import { TenantModule } from './modules/tenant/tenant.module';
import { UserModule } from './modules/user/user.module';
import { PatientModule } from './modules/patient/patient.module';
import { StaffModule } from './modules/staff/staff.module';
import { AppointmentModule } from './modules/appointment/appointment.module';
import { OpdModule } from './modules/opd/opd.module';
import { IpdModule } from './modules/ipd/ipd.module';
import { PharmacyModule } from './modules/pharmacy/pharmacy.module';
import { LaboratoryModule } from './modules/laboratory/laboratory.module';
import { RadiologyModule } from './modules/radiology/radiology.module';
import { BillingModule } from './modules/billing/billing.module';
import { InsuranceModule } from './modules/insurance/insurance.module';
import { HrModule } from './modules/hr/hr.module';
import { SettingsModule } from './modules/settings/settings.module';
import { ReportsModule } from './modules/reports/reports.module';
import { DepartmentModule } from './modules/department/department.module';
import { FinanceModule } from './modules/finance/finance.module';
import { SurgeryModule } from './modules/surgery/surgery.module';
import { EmergencyModule } from './modules/emergency/emergency.module';
import { InventoryModule } from './modules/inventory/inventory.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    AuthModule,
    TenantModule,
    UserModule,
    PatientModule,
    StaffModule,
    AppointmentModule,
    OpdModule,
    IpdModule,
    PharmacyModule,
    LaboratoryModule,
    RadiologyModule,
    BillingModule,
    InsuranceModule,
    HrModule,
    SettingsModule,
    ReportsModule,
    DepartmentModule,
    FinanceModule,
    SurgeryModule,
    EmergencyModule,
    InventoryModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
