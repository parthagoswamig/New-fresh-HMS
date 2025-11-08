import { PartialType } from '@nestjs/swagger';
import { CreateIpdDto } from './create-ipd.dto';

export class UpdateIpdDto extends PartialType(CreateIpdDto) {}
