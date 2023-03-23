import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class GetOneMovementInput {
  @ApiProperty({
    example: '5f9f1c1b0e1c0c0c0c0c0c0c',
  })
  @IsUUID()
  uid: string;
}
