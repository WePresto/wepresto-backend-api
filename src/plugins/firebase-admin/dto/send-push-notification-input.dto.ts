export class SendPushNotificationInput {
  readonly fcmToken: string;

  readonly title: string;

  readonly body: string;

  readonly requireInteraction?: boolean;

  readonly actions?: {
    title: string;
    action: string;
    icon?: string;
  }[];

  data?: {
    [key: string]: string;
  };
}
