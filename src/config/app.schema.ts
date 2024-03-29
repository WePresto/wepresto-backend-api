import * as Joi from 'joi';

export default Joi.object({
  /* APP */
  PORT: Joi.required(),
  SELF_API_URL: Joi.string().required(),
  SELF_WEB_URL: Joi.required(),

  /* DATABASE */
  DATABASE_CLIENT: Joi.required(),
  DATABASE_HOST: Joi.required(),
  DATABASE_PORT: Joi.number().default(5432),
  DATABASE_USER: Joi.required(),
  DATABASE_PASSWORD: Joi.required(),
  DATABASE_NAME: Joi.required(),
  DATABASE_LOG: Joi.required(),

  // BASIC ACL
  BASIC_ACL_COMPANY_UID: Joi.required(),
  BASIC_ACL_ACCESS_KEY: Joi.required(),
  BASIC_ACL_LENDER_ROLE_CODE: Joi.required(),
  BASIC_ACL_BORROWER_ROLE_CODE: Joi.required(),

  // RABBITMQ
  RABBITMQ_URL: Joi.required(),
  RABBITMQ_EXCHANGE: Joi.required(),
  RABBITMQ_WAIT_FOR_CONNECTION: Joi.required(),

  // TWILIO
  //TWILIO_ACCOUNT_SID: Joi.required(),
  //TWILIO_AUTH_TOKEN: Joi.required(),
  //TWILIO_MESSAGING_SERVICE_SID: Joi.required(),

  // EPAYCO
  //EPAYCO_P_CUST_ID: Joi.required(),
  //EPAYCO_P_KEY: Joi.required(),
  //EPAYCO_PUBLIC_KEY: Joi.required(),
  //EPAYCO_PRIVATE_KEY: Joi.required(),
  //EPAYCO_TESTING: Joi.required(),

  // MONGODB
  MONGODB_URI: Joi.required(),

  // REDIS
  REDIS_URL: Joi.required(),
  REDIS_KEY_PREFIX: Joi.string().default('wepresto_'),

  // MESSAGEBIRD
  //MESSAGEBIRD_API_KEY: Joi.required(),

  // SLACK
  SLACK_TOKEN: Joi.required(),

  // GCP
  GCP_TYPE: Joi.required(),
  GCP_PROJECT_ID: Joi.required(),
  GCP_PRIVATE_KEY_ID: Joi.required(),
  GCP_PRIVATE_KEY: Joi.required(),
  GCP_CLIENT_EMAIL: Joi.required(),
  GCP_CLIENT_ID: Joi.required(),
  GCP_AUTH_URI: Joi.required(),
  GCP_TOKEN_URI: Joi.required(),
  GCP_AUTH_PROVIDER_X509_CERT_URL: Joi.required(),
  GCP_CLIENT_X509_CERT_URL: Joi.required(),

  // SENDGRID
  SENDGRID_API_KEY: Joi.required(),
  SENDGRID_EMAIL_FROM: Joi.required(),
});
