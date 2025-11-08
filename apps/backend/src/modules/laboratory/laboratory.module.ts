import { Module } from '@nestjs/common';
import { LaboratoryController } from './laboratory.controller';
import { LaboratoryService } from './laboratory.service';
import { LabEntryController } from './lab-entry.controller';
import { LabEntryService } from './lab-entry.service';
import { LabTestController } from './lab-test.controller';
import { LabTestService } from './lab-test.service';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [LaboratoryController, LabEntryController, LabTestController],
  providers: [LaboratoryService, LabEntryService, LabTestService],
  exports: [LaboratoryService, LabEntryService, LabTestService],
})
export class LaboratoryModule {}
