import { Module } from '@nestjs/common';
import { LaboratoryController } from './laboratory.controller';
import { LaboratoryService } from './laboratory.service';
import { LabEntryController } from './lab-entry.controller';
import { LabEntryService } from './lab-entry.service';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [LaboratoryController, LabEntryController],
  providers: [LaboratoryService, LabEntryService],
  exports: [LaboratoryService, LabEntryService],
})
export class LaboratoryModule {}
