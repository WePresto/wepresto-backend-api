/* eslint-disable no-console */
import * as dotenv from 'dotenv';
import { SNSClient, PublishCommand } from '@aws-sdk/client-sns';

dotenv.config();

(async () => {
  // console.log('process.env.AWS_REGION:', process.env.AWS_REGION);

  // a client can be shared by different commands.
  const client = new SNSClient({ region: process.env.AWS_REGION });

  const command = new PublishCommand({
    PhoneNumber: '+573052151278',
    Message: 'Hello from SNS! again :) 7',
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
