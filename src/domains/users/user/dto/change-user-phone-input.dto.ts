import { ApiProperty } from '@nestjs/swagger';
import { IsString, Length } from 'class-validator';

export class ChangeUserPhoneInput {
  @ApiProperty({
    example: 'auth0|5f9f1c1b0e1c0c0c0c0c0c0c',
  })
  @IsString()
  readonly authUid: string;

  @ApiProperty({
    example: '1234567890',
  })
  @Length(10)
  @IsString()
  readonly phone: string;
}
