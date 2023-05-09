import { ApiProperty } from '@nestjs/swagger';
import { IsPositive, IsString, IsUUID } from 'class-validator';

export class RequestWithdrawalInput {
  @ApiProperty({
    example: '5f9f1c1b0e1c0c0c0c0c0c0c',
  })
  @IsUUID()
  readonly lenderUid: string;

  @ApiProperty({
    example: 1000,
  })
  @IsPositive()
  readonly amount: number;

  @ApiProperty({
    example: 'BANCOLOMBIA',
  })
  @IsString()
  readonly bank: string;

  @ApiProperty({
    example: 'SAVINGS',
  })
  @IsString()
  readonly accountType: string;

  @ApiProperty({
    example: '123456789',
  })
  @IsString()
  readonly accountNumber: string;
}
