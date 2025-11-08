import { PartialType } from '@nestjs/swagger';
import { CreateRadiologyTestDto } from './create-radiology-test.dto';

export class UpdateRadiologyTestDto extends PartialType(CreateRadiologyTestDto) {}
