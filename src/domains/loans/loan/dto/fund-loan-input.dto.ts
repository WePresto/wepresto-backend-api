import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsUUID } from 'class-validator';

export class FundLoanInput {
  @ApiProperty({
    example: '5f9f1c1b0e1c0c0c0c0c0c0c',
  })
  @IsUUID()
  readonly uid: string;

  @ApiProperty({
    example: 'prestamo aprobado',
  })
  @IsOptional()
  @IsString()
  readonly comment?: string;
}
