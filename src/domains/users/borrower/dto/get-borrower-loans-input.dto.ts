import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsNumberString,
  IsUUID,
} from 'class-validator';

export class GetBorrowerLoansInput {
  @ApiProperty({
    example: 'erotljerkjltjkldfjgdgfgd',
  })
  @IsUUID()
  readonly uid: string;

  @ApiPropertyOptional({
    example: 'PAYMENT',
  })
  @IsOptional()
  @IsString()
  readonly statuses?: string;

  @ApiPropertyOptional({
    example: 'dfksljl',
  })
  @IsOptional()
  @IsString()
  readonly q?: string;

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
