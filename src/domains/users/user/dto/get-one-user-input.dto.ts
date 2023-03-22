import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class GetOneUserInput {
  @ApiProperty({
    example: 'auth0|5f9f1c1b0e1c0c0c0c0c0c0c',
  })
  @IsString()
  authUid: string;
}
