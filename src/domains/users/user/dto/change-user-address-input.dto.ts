import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class ChangeUserAddressInput {
  @ApiProperty({
    example: 'auth0|5f9f1c1b0e1c0c0c0c0c0c0c',
  })
  @IsString()
  readonly authUid: string;

  @ApiProperty({
    example: 'Calle 123',
  })
  @IsString()
  readonly address: string;
}
