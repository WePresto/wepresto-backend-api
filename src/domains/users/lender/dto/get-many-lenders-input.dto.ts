import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumberString, IsOptional, IsString } from 'class-validator';

export class GetManyLendersInput {
  @ApiPropertyOptional({
    example: 'Juan Perez',
  })
  @IsOptional()
  @IsString()
  readonly fullName?: string;

  @ApiPropertyOptional({
    example: '12345678',
  })
  @IsOptional()
  @IsString()
  readonly documentNumber?: string;

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
