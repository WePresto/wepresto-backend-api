import { Inject, Injectable } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom } from 'rxjs';

import appConfig from '../../../config/app.config';

import { EventMessageService } from '../../event-message/event-message.service';

import { getReferenceDate } from '../../../utils';

import { SendPaymentPushNotificationInput } from './dto/send-payment-push-notification-input.dto';
import { GetPaymentStatusInput } from './dto/get-payment-status-input.dto';

@Injectable()
export class NequiService {
  constructor(
    @Inject(appConfig.KEY)
    private readonly appConfiguration: ConfigType<typeof appConfig>,
    private readonly httpService: HttpService,
    private readonly eventMessageService: EventMessageService,
  ) {}

  public async getAccessToken(): Promise<string> {
    const {
      nequi: { authUrl, clientId, clientSecret },
    } = this.appConfiguration;

    const observable = this.httpService.post(
      `${authUrl}token?grant_type=client_credentials`,
      {},
      {
        headers: {
          Authorization:
            'Basic ' +
            Buffer.from(`${clientId}:${clientSecret}`).toString('base64'),
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      },
    );

    try {
      const { data } = await lastValueFrom(observable);

      return data.access_token;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  public async sendPaymentPushNotification(
    input: SendPaymentPushNotificationInput,
  ): Promise<any> {
    const { phoneNumber, value } = input;

    const eventMessage = await this.eventMessageService.create({
      data: {
        ...input,
      },
      functionName: 'sendPaymentPushNotification',
      routingKey: 'no-routing-key',
    });

    const {
      nequi: { url, apiKey },
    } = this.appConfiguration;

    const accessToken = await this.getAccessToken();

    // const macAddress = getMacAddress();

    const observable = this.httpService.post(
      `${url}payments/v2/-services-paymentservice-unregisteredpayment`,
      {
        RequestMessage: {
          RequestHeader: {
            Channel: 'PNP04-C001',
            RequestDate: getReferenceDate(new Date(), 'America/Bogota'),
            MessageID: eventMessage.id,
            ClientID: '12345',
            Destination: {
              ServiceName: 'PaymentsService',
              ServiceOperation: 'unregisteredPayment',
              ServiceRegion: 'C001',
              ServiceVersion: '1.2.0',
            },
          },
          RequestBody: {
            any: {
              unregisteredPaymentRQ: {
                phoneNumber,
                code: 'NIT_1',
                value,
              },
            },
          },
        },
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'x-api-key': apiKey,
        },
      },
    );

    try {
      const { data } = await lastValueFrom(observable);

      const statusCode = data?.ResponseMessage?.Status?.StatusCode;

      if (statusCode !== '0') {
        const StatusDesc = data?.ResponseMessage?.Status?.StatusDesc;
        throw new Error(`nequi says: ${StatusDesc}`);
      }

      return data;
    } catch (error) {
      console.error(error);

      await this.eventMessageService.setError({
        id: eventMessage.id,
        error: error.toJSON(),
      });
      throw error;
    }
  }

  public async getPaymentStatus(input: GetPaymentStatusInput) {
    const { transactionId } = input;

    const {
      nequi: { url, apiKey },
    } = this.appConfiguration;

    const accessToken = await this.getAccessToken();

    const observable = this.httpService.post(
      `${url}payments/v2/-services-paymentservice-getstatuspayment`,
      {
        RequestMessage: {
          RequestHeader: {
            Channel: 'PNP04-C001',
            RequestDate: getReferenceDate(new Date(), 'America/Bogota'),
            MessageID: '644062e9094f9fb53154b438',
            ClientID: '12345',
            Destination: {
              ServiceName: 'PaymentsService',
              ServiceOperation: 'getStatusPayment',
              ServiceRegion: 'C001',
              ServiceVersion: '1.0.0',
            },
          },
          RequestBody: {
            any: {
              getStatusPaymentRQ: {
                codeQR: transactionId,
              },
            },
          },
        },
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'x-api-key': apiKey,
        },
      },
    );

    const { data } = await lastValueFrom(observable);

    return data;
  }
}
