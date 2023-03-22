import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsUUID } from 'class-validator';

export class ApplyLoanInput {
  @ApiProperty({
    example: '5f9f1c1b0e1c0c0c0c0c0c0c',
  })
  @IsUUID()
  readonly borrowerUid: string;

  @ApiProperty({
    example: 1000,
  })
  @IsNumber()
  readonly amount: number;
}
