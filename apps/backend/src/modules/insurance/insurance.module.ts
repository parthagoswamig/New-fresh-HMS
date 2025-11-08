import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { InsuranceController } from './insurance.controller';
import { InsuranceCompanyService } from './insurance-company.service';
import { InsurancePolicyService } from './insurance-policy.service';
import { PatientInsuranceService } from './patient-insurance.service';
import { InsuranceClaimService } from './insurance-claim.service';

@Module({
  imports: [PrismaModule],
  controllers: [InsuranceController],
  providers: [
    InsuranceCompanyService,
    InsurancePolicyService,
    PatientInsuranceService,
    InsuranceClaimService,
  ],
  exports: [
    InsuranceCompanyService,
    InsurancePolicyService,
    PatientInsuranceService,
    InsuranceClaimService,
  ],
})
export class InsuranceModule {}
