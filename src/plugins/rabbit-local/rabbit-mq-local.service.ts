import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';

import appConfig from '../../config/app.config';

import { getRabbitMQExchangeName } from '../../utils';

import { PublishLoanDisbursementInput } from './dto/publish-loan-disbursement-input.dto';
import { PublishPaymentCreatedInput } from './dto/publish-payment-created-input.dto';
import { PublishSettleLatePaymentInterestInput } from './dto/publish-settle-late-payment-interest-input.dto';
import { PublishWithdrawalCompletedInput } from './dto/publish-withdrawal-completed-input.dto';
import { PublishLoanParticipationCreatedInput } from './dto/publish-loan-participation-created-input.dto';
import { PublishLoanInFundingInput } from './dto/publish-loan-in-funding-input.dto';
import { PublishLoanInReviewInput } from './dto/publish-loan-in-review-input.dto';

@Injectable()
export class RabbitMQLocalService {
  private exchangeName: string;

  constructor(
    @Inject(appConfig.KEY)
    private readonly appConfiguration: ConfigType<typeof appConfig>,
    private readonly amqpConnection: AmqpConnection,
  ) {
    this.exchangeName = getRabbitMQExchangeName();
  }

  public async publishLoanDisbursement(
    input: PublishLoanDisbursementInput,
  ): Promise<void> {
    const { loanUid } = input;

    const { exchangeName } = this;

    const routingKey = `${exchangeName}.loan_disbursement`;

    await this.amqpConnection.publish(exchangeName, routingKey, {
      loanUid,
    });

    Logger.log(
      `message published to exchange ${exchangeName} ` +
        `for routing key ${routingKey} with input: ${JSON.stringify(input)}`,
      RabbitMQLocalService.name + '.publishLoanDisbursement',
    );
  }

  public async publishPaymentCreated(
    input: PublishPaymentCreatedInput,
  ): Promise<void> {
    const { exchangeName } = this;

    const routingKey = `${exchangeName}.payment_created`;

    await this.amqpConnection.publish(exchangeName, routingKey, {
      ...input,
    });

    Logger.log(
      `message published to exchange ${exchangeName} ` +
        `for routing key ${routingKey} with input: ${JSON.stringify(input)}`,
      RabbitMQLocalService.name + '.publishPaymentCreated',
    );
  }

  public async publishLoanApplication(
    input: PublishLoanDisbursementInput,
  ): Promise<void> {
    const { loanUid } = input;

    const { exchangeName } = this;

    const routingKey = `${exchangeName}.loan_application`;

    await this.amqpConnection.publish(exchangeName, routingKey, {
      loanUid,
    });

    Logger.log(
      `message published to exchange ${exchangeName} ` +
        `for routing key ${routingKey} with input: ${JSON.stringify(input)}`,
      RabbitMQLocalService.name + '.publishLoanApplication',
    );
  }

  public async publishSettleLatePaymentInterest(
    input: PublishSettleLatePaymentInterestInput,
  ): Promise<void> {
    const { timeZone } = input;

    const { exchangeName } = this;

    const routingKey = `${exchangeName}.settle_late_payment_interest`;

    await this.amqpConnection.publish(exchangeName, routingKey, {
      timeZone,
    });

    Logger.log(
      `message published to exchange ${exchangeName} ` +
        `for routing key ${routingKey} with input: ${JSON.stringify(input)}`,
      RabbitMQLocalService.name + '.publishSettleLatePaymentInterest',
    );
  }

  public async publishSendEarlyPaymentNotifications() {
    const { exchangeName } = this;

    const routingKey = `${exchangeName}.send_early_payment_notifications`;

    await this.amqpConnection.publish(exchangeName, routingKey, {});

    Logger.log(
      `message published to exchange ${exchangeName} ` +
        `for routing key ${routingKey}`,
      RabbitMQLocalService.name + '.publishSendEarlyPaymentNotifications',
    );
  }

  public async publishWithdrawalCompleted(
    input: PublishWithdrawalCompletedInput,
  ): Promise<void> {
    const { exchangeName } = this;

    const routingKey = `${exchangeName}.withdrawal_completed`;

    await this.amqpConnection.publish(exchangeName, routingKey, {
      ...input,
    });

    Logger.log(
      `message published to exchange ${exchangeName} ` +
        `for routing key ${routingKey} with input: ${JSON.stringify(input)}`,
      RabbitMQLocalService.name + '.publishWithdrawalCompleted',
    );
  }

  public async publishLoanParticipationCreated(
    input: PublishLoanParticipationCreatedInput,
  ): Promise<void> {
    const { exchangeName } = this;

    const routingKey = `${exchangeName}.loan_participation_created`;

    await this.amqpConnection.publish(exchangeName, routingKey, {
      ...input,
    });

    Logger.log(
      `message published to exchange ${exchangeName} ` +
        `for routing key ${routingKey} with input: ${JSON.stringify(input)}`,
      RabbitMQLocalService.name + '.publishLoanParticipationCreated',
    );
  }

  public async publishSendLatePaymentNotifications() {
    const { exchangeName } = this;

    const routingKey = `${exchangeName}.send_late_payment_notifications`;

    await this.amqpConnection.publish(exchangeName, routingKey, {});

    Logger.log(
      `message published to exchange ${exchangeName} ` +
        `for routing key ${routingKey}`,
      RabbitMQLocalService.name + '.publishSendLatePaymentNotifications',
    );
  }

  public async publishLoanInFunding(input: PublishLoanInFundingInput) {
    const { loanUid } = input;

    const routingKey = `${this.exchangeName}.loan_in_funding`;

    await this.amqpConnection.publish(this.exchangeName, routingKey, {
      loanUid,
    });

    Logger.log(
      `message published to exchange ${this.exchangeName} ` +
        `for routing key ${routingKey} with input: ${JSON.stringify(input)}`,
      RabbitMQLocalService.name + '.publishLoanInFunding',
    );
  }

  public async publishLoanInReview(input: PublishLoanInReviewInput) {
    const { loanUid } = input;

    const routingKey = `${this.exchangeName}.loan_in_review`;

    await this.amqpConnection.publish(this.exchangeName, routingKey, {
      loanUid,
    });

    Logger.log(
      `message published to exchange ${this.exchangeName} ` +
        `for routing key ${routingKey} with input: ${JSON.stringify(input)}`,
      RabbitMQLocalService.name + '.publishLoanInReview',
    );
  }
}
