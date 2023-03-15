import { IsString, Length } from 'class-validator';

export class ChangeUserPasswordInput {
  @IsString()
  authUid: string;

  @Length(6, 16)
  @IsString()
  readonly oldPassword: string;

  @Length(6, 16)
  @IsString()
  readonly newPassword: string;
}
