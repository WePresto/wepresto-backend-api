import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumberString, IsOptional, IsString } from 'class-validator';

export class GetManyUsersInput {
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
