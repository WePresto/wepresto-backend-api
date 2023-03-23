import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsNumberString,
} from 'class-validator';

export class GetBorrowerLoansInput {
  @ApiProperty({
    example: 'erotljerkjltjkldfjgdgfgd',
  })
  @IsNotEmpty()
  @IsString()
  readonly uid: string;

  @ApiPropertyOptional({
    example: 'PAYMENT',
  })
  @IsOptional()
  @IsString()
  readonly statuses?: string;

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
