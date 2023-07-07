import { IsString, IsUrl } from 'class-validator';

export class CreateGeneralPushNotificationInput {
  @IsString()
  readonly title: string;

  @IsString()
  readonly body: string;

  @IsUrl()
  readonly link: string;
}
