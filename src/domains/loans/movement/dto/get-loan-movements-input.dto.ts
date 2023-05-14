import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsNumberString,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

export class GetLoanMovementsInput {
  @ApiProperty({
    example: 'f0a0a0a0-a0a0-0a0a-0a0a-a0a0a0a0a0a0',
  })
  @IsUUID()
  readonly loanUid: string;

  @ApiPropertyOptional({
    example: 'PAYMENT',
  })
  @IsOptional()
  @IsString()
  readonly types: string;

  @ApiPropertyOptional({
    example: '2020-01-01',
  })
  @IsOptional()
  @IsDateString({
    format: 'YYYY-MM-DD',
    length: 10,
  })
  readonly startDate?: string;

  @ApiPropertyOptional({
    example: '2020-01-01',
  })
  @IsOptional()
  @IsDateString({
    format: 'YYYY-MM-DD',
    length: 10,
  })
  readonly endDate?: string;

  @ApiPropertyOptional({
    example: '10',
  })
  @IsOptional()
  @IsNumberString()
  readonly startAmount?: string;

  @ApiPropertyOptional({
    example: '100',
  })
  @IsOptional()
  @IsNumberString()
  readonly endAmount?: string;

  @ApiPropertyOptional({
    example: '1',
  })
  @IsOptional()
  @IsNumberString()
  readonly take?: string;

  @ApiPropertyOptional({
    example: '0',
  })
  @IsOptional()
  @IsNumberString()
  readonly skip?: string;
}
