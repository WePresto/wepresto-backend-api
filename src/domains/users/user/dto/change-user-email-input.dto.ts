import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString } from 'class-validator';

export class ChangeUserEmailInput {
  @ApiProperty({
    example: 'auth0|5f9f1c1b0e1c0c0c0c0c0c0c',
  })
  @IsString()
  readonly authUid: string;

  @ApiProperty({
    example: 'hehe@ferxxo.com',
  })
  @IsEmail()
  readonly email: string;
}
