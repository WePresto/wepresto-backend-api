import { ApiProperty } from '@nestjs/swagger';
import {
  IsDateString,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

export class ApproveLoanInput {
  @ApiProperty({
    example: '5f9f1c1b0e1c0c0c0c0c0c0c',
  })
  @IsUUID()
  readonly uid: string;

  @ApiProperty({
    example: 0.1,
  })
  @IsNumber()
  readonly annualInterestRate: number;

  @ApiProperty({
    example: 12,
  })
  @IsNumber()
  readonly term: number;

  @ApiProperty({
    example: '2020-12-31',
  })
  @IsDateString({
    format: 'YYYY-MM-DD',
    length: 10,
  })
  readonly startDate: string;

  @ApiProperty({
    example: 'prestamo aprobado',
  })
  @IsOptional()
  @IsString()
  readonly comment?: string;
}
