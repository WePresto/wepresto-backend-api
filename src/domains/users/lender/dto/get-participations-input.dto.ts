import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumberString, IsOptional, IsUUID } from 'class-validator';

export class GetParticipationsInput {
  @ApiProperty({
    example: '5f9f1c1b0e1c0c0c0c0c0c0c',
  })
  @IsUUID()
  readonly uid: string;

  @ApiPropertyOptional({
    example: '0',
  })
  @IsOptional()
  @IsNumberString()
  readonly startAmount?: string;

  @ApiPropertyOptional({
    example: '0',
  })
  @IsOptional()
  @IsNumberString()
  readonly endAmount?: string;

  @ApiPropertyOptional({
    example: '0',
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
