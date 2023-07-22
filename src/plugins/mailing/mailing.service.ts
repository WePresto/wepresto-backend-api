// eslint-disable-next-line @typescript-eslint/no-var-requires
const sgMail = require('@sendgrid/mail');

import * as fs from 'fs';
import * as path from 'path';
import * as mjml2html from 'mjml';
import hbs from 'handlebars';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';

import appConfig from '../../config/app.config';

import { GetEmailTemplateStringInput } from './dto/get-email-template-string-input.dto';
import { GenerateEmailTemplateHTMLInput } from './dto/generate-email-tamplate-html-input.dto';
import { SendEmailInput } from './dto/send-email-input.dto';

@Injectable()
export class MailingService {
  private mg;

  constructor(
    @Inject(appConfig.KEY)
    private readonly appConfiguration: ConfigType<typeof appConfig>,
  ) {
    const {
      sendgrid: { apiKey },
    } = this.appConfiguration;

    sgMail.setApiKey(apiKey);
  }

  private getEmailTemplateString(input: GetEmailTemplateStringInput): string {
    const { templateName } = input;

    // C:\Users\cristiandi\coding\companies\easy-presta\ezpresta-api\templates\ADMINISTRATOR_LOAN_REQUEST_CREATED.mjml
    const templatePath = path.resolve(
      __dirname,
      `./templates/${templateName}.mjml`,
    );

    // check if the template exists at fs
    if (!fs.existsSync(templatePath)) {
      throw new Error(`template ${templateName} does not exist`);
    }

    // read the template
    const templateString = fs.readFileSync(templatePath, 'utf8');

    return templateString;
  }

  private generateHTML(input: GenerateEmailTemplateHTMLInput): string {
    const { templateName } = input;

    // get the email template string
    const templateString = this.getEmailTemplateString({
      templateName,
    });

    // compile the template
    const template = hbs.compile(templateString);

    const { parameters } = input;

    // get the result
    const result = template(parameters);

    // get the html
    const { html } = mjml2html(result);

    return html;
  }

  public async sendEmail(input: SendEmailInput): Promise<void> {
    const { to, subject, templateName, parameters, text, attachments } = input;

    const {
      sendgrid: { from },
    } = this.appConfiguration;

    const html = this.generateHTML({
      templateName,
      parameters,
    });

    // console.log('html');
    // console.log(html);
    // console.log('html');

    const subjectToUse =
      this.appConfiguration.environment === 'production'
        ? subject
        : `${this.appConfiguration.environment} | ${subject}`;

    await sgMail.send({
      to,
      from,
      subject: subjectToUse,
      text,
      html,
      attachments,
    });

    Logger.log('sendEmail: email sent successfully', MailingService.name);
  }
}
