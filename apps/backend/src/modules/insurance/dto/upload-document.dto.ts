import { IsString, IsUrl } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UploadDocumentDto {
  @ApiProperty({ description: 'Document name' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'Document URL (from Supabase Storage)' })
  @IsUrl()
  url: string;

  @ApiProperty({ description: 'Document type', example: 'policy_copy' })
  @IsString()
  type: string;
}
