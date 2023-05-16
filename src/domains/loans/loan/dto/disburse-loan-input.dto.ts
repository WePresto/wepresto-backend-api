import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsUUID, IsOptional, IsString, IsDateString } from 'class-validator';

export class DisburseLoanInput {
  @ApiProperty({
    example: '5f9f1c1b0e1c0c0c0c0c0c0c',
  })
  @IsUUID()
  readonly uid: string;

  @ApiPropertyOptional({
    example: 'prestamo desembolsado',
  })
  @IsOptional()
  @IsString()
  readonly comment?: string;

  @ApiPropertyOptional({
    example: '2020-10-10',
  })
  @IsOptional()
  @IsDateString({
    format: 'YYYY-MM-DD',
    length: 10,
  })
  readonly disbursementDate?: string;
}
