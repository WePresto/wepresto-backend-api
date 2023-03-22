import { ApiProperty } from '@nestjs/swagger';
import { IsString, Length } from 'class-validator';

export class ChangeUserPasswordInput {
  @ApiProperty({
    example: 'auth0|5f9f1c1b0e1c0c0c0c0c0c0c',
  })
  @IsString()
  authUid: string;

  @ApiProperty({
    example: 'r3ew_3242ew',
  })
  @Length(6, 16)
  @IsString()
  readonly oldPassword: string;

  @ApiProperty({
    example: 'dsfdsferf.dsfsdf3',
  })
  @Length(6, 16)
  @IsString()
  readonly newPassword: string;
}
