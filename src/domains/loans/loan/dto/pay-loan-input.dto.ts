import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsUUID, IsOptional, IsString } from 'class-validator';

export class PayLoanInput {
  @ApiProperty({
    example: '5f9f1c1b0e1c0c0c0c0c0c0c',
  })
  @IsUUID()
  readonly uid: string;

  @ApiPropertyOptional({
    example: 'prestamo pagado',
  })
  @IsOptional()
  @IsString()
  readonly comment?: string;
}
