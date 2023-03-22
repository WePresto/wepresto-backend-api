import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsUUID } from 'class-validator';

export class ReviewLoanInput {
  @ApiProperty({
    example: '5f9f1c1b0e1c0c0c0c0c0c0c',
  })
  @IsUUID()
  readonly uid: string;

  @ApiPropertyOptional({
    example: 'el usuario solicita un prestamo pero tiene prestamos pendientes',
  })
  @IsOptional()
  @IsString()
  readonly comment?: string;
}
