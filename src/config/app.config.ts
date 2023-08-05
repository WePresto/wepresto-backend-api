import { registerAs } from '@nestjs/config';

export default registerAs('config', () => {
  return {
    environment: process.env.NODE_ENV || 'development',
    app: {
      port: parseInt(process.env.PORT, 10) || 8080,
      selfApiUrl: process.env.SELF_API_URL,
      selftWebUrl: process.env.SELF_WEB_URL,
      apiKey: process.env.API_KEY,
    },
    database: {
      client: process.env.DATABASE_CLIENT,
      host: process.env.DATABASE_HOST,
      port: parseInt(process.env.DATABASE_PORT, 10) || 5432,
      user: process.env.DATABASE_USER,
      password: process.env.DATABASE_PASSWORD,
      database: process.env.DATABASE_NAME,
      log: process.env.DATABASE_LOG || 'yes',
    },
    acl: {
      companyUid: process.env.BASIC_ACL_COMPANY_UID,
      accessKey: process.env.BASIC_ACL_ACCESS_KEY,
      roles: {
        lenderCode: process.env.BASIC_ACL_LENDER_ROLE_CODE,
        borrowerCode: process.env.BASIC_ACL_BORROWER_ROLE_CODE,
      },
    },
    rabbitmq: {
      url: process.env.RABBITMQ_URL,
      exchange: process.env.RABBITMQ_EXCHANGE,
      waitForConnection: process.env.RABBITMQ_WAIT_FOR_CONNECTION === '1',
    },
    twilio: {
      accountSid: process.env.TWILIO_ACCOUNT_SID,
      authToken: process.env.TWILIO_AUTH_TOKEN,
      messagingServiceSid: process.env.TWILIO_MESSAGING_SERVICE_SID,
    },
    epayco: {
      pCustId: process.env.EPAYCO_P_CUST_ID,
      pKey: process.env.EPAYCO_P_KEY,
      publicKey: process.env.EPAYCO_PUBLIC_KEY,
      privateKey: process.env.EPAYCO_PRIVATE_KEY,
      testing: process.env.EPAYCO_TESTING === '1',
    },
    mailgun: {
      domain: process.env.MAILGUN_DOMAIN,
      from: process.env.MAILGUN_EMAIL_FROM,
      privateKey: process.env.MAILGUN_PRIVATE_KEY,
      publicKey: process.env.MAILGUN_PUBLIC_KEY,
    },
    sendgrid: {
      apiKey: process.env.SENDGRID_API_KEY,
      from: process.env.SENDGRID_EMAIL_FROM,
    },
    mongoDB: {
      uri: process.env.MONGODB_URI,
    },
    redis: {
      url: process.env.REDIS_URL,
      keyPrefix: process.env.REDIS_KEY_PREFIX,
    },
    messagebird: {
      apiKey: process.env.MESSAGEBIRD_API_KEY,
    },
    slack: {
      token: process.env.SLACK_TOKEN,
    },
    nequi: {
      authUrl: process.env.NEQUI_AUTH_URL,
      url: process.env.NEQUI_URL,
      clientId: process.env.NEQUI_CLIENT_ID,
      clientSecret: process.env.NEQUI_CLIENT_SECRET,
      apiKey: process.env.NEQUI_API_KEY,
    },
    googleServiceAccount: {
      type: process.env.GCP_TYPE,
      projectId: process.env.GCP_PROJECT_ID,
      privateKeyId: process.env.GCP_PRIVATE_KEY_ID,
      privateKey: process.env.GCP_PRIVATE_KEY.replace(/\\n/g, '\n'),
      clientEmail: process.env.GCP_CLIENT_EMAIL,
      clientId: process.env.GCP_CLIENT_ID,
      authUri: process.env.GCP_AUTH_URI,
      tokenUri: process.env.GCP_TOKEN_URI,
      authProviderX509CertUrl: process.env.GCP_AUTH_PROVIDER_X509_CERT_URL,
      clientC509CertUrl: process.env.GCP_CLIENT_X509_CERT_URL,
    },
    aws: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      region: process.env.AWS_REGION,
    },
  };
});
