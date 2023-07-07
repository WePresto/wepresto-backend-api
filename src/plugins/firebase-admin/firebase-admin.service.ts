import * as firebaseAdmin from 'firebase-admin';

import { Inject, Injectable } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { App } from 'firebase-admin/app';
import { credential } from 'firebase-admin';
import { getMessaging } from 'firebase-admin/messaging';

import appConfig from '../../config/app.config';

import { SendPushNotificationInput } from './dto/send-push-notification-input.dto';

@Injectable()
export class FirebaseAdminService {
  private readonly admin: App;

  constructor(
    @Inject(appConfig.KEY)
    private readonly appConfiguration: ConfigType<typeof appConfig>,
  ) {
    const { googleServiceAccount } = this.appConfiguration;

    this.admin = firebaseAdmin.initializeApp({
      credential: credential.cert({
        projectId: googleServiceAccount.projectId,
        clientEmail: googleServiceAccount.clientEmail,
        privateKey: googleServiceAccount.privateKey,
      }),
    });
  }

  public async sendPushNotification(input: SendPushNotificationInput) {
    const { fcmToken, title, body, requireInteraction, actions, data } = input;

    const messaging = getMessaging(this.admin);

    const result = await messaging.send({
      webpush: {
        notification: {
          title,
          body,
          icon: 'https://www.wepresto.com/images/icons/icon-72x72.png',
          requireInteraction: requireInteraction ?? false,
          actions,
          data,
        },
      },
      token: fcmToken,
    });

    // eslint-disable-next-line no-console
    console.log('result', result);
  }
}
