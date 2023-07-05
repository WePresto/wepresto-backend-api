import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { md5 } from 'hash-wasm';

import appConfig from '../../config/app.config';

import { EventMessageDocument } from './event-message.schema';

import { CreateEventMessageInput } from './dto/create-envent-message-input.dto';
import { SetEventMessageErrorInput } from './dto/set-event-message-error-input.dto';

@Injectable()
export class EventMessageService {
  constructor(
    @Inject(appConfig.KEY)
    private readonly appConfiguration: ConfigType<typeof appConfig>,
    @InjectModel('EventMessage')
    private readonly eventMessageModel: Model<EventMessageDocument>,
  ) {}

  public async create(
    input: CreateEventMessageInput,
  ): Promise<EventMessageDocument> {
    const { routingKey, functionName, data, error } = input;

    const { environment } = this.appConfiguration;

    const hash = await md5(
      `${routingKey}-${functionName}-${JSON.stringify(data)}`,
    );

    const newEventMessage = new this.eventMessageModel({
      hash,
      routingKey,
      functionName,
      data,
      error,
      environment,
    });

    const savedEventMessage = await newEventMessage.save();

    return savedEventMessage;
  }

  public async setError(
    input: SetEventMessageErrorInput,
  ): Promise<EventMessageDocument> {
    const { id, error } = input;

    const updatedEventMessage = await this.eventMessageModel.findByIdAndUpdate(
      id,
      {
        $set: {
          error,
        },
      },
    );

    return updatedEventMessage;
  }

  public async clearOldMessages(): Promise<void> {
    // delete messages older than 30 days

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const result = await this.eventMessageModel.deleteMany({
      createdAt: {
        $lte: thirtyDaysAgo,
      },
    });

    Logger.log(
      `Deleted ${result.deletedCount} messages older than 30 days`,
      EventMessageService.name,
    );
  }
}
