/* eslint-disable no-console */
import * as dotenv from 'dotenv';
import { SNSClient, PublishCommand } from '@aws-sdk/client-sns';

dotenv.config();

(async () => {
  // console.log('process.env.AWS_REGION:', process.env.AWS_REGION);

  // a client can be shared by different commands.
  const client = new SNSClient({ region: process.env.AWS_REGION });

  const firstName = 'Juan';

  const command = new PublishCommand({
    PhoneNumber: '+573016666666',
    Message: `${firstName}, hoy es el último día para realizar el pago de tu cuota. Ingresa a WePreso para realizar el pago :)`,
  });

  const response = await client.send(command);

  console.log('response:', response);
  console.log('sms sent');
})()
  .catch((err) => {
    console.error(err);
  })
  .finally(() => {
    process.exit();
  });
