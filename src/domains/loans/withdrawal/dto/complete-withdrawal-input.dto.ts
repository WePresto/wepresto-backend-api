import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsUUID } from 'class-validator';

export class CompleteWithdrawalInput {
  @ApiProperty({
    example: 'f0a0a0a0-a0a0-0a0a-0a0a-a0a0a0a0a0a0',
  })
  @IsUUID()
  readonly uid: string;

  @IsOptional()
  readonly file?: any;
}
