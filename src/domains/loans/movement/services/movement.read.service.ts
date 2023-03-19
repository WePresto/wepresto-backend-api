import { Inject } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import appConfig from '../../../../config/app.config';

import { Movement } from '../movement.entity';

import { BaseService } from '../../../../common/base.service';

import { GetOneMovementInput } from '../dto/get-one-movement-input.dto';

export class MovementReadService extends BaseService<Movement> {
  constructor(
    @Inject(appConfig.KEY)
    private readonly appConfiguration: ConfigType<typeof appConfig>,
    @InjectRepository(Movement)
    private readonly movementRepository: Repository<Movement>,
  ) {
    super(movementRepository);
  }

  public async getOne(input: GetOneMovementInput): Promise<Movement> {
    const { uid } = input;

    const existingMovement = await this.getOneByFields({
      fields: {
        uid,
      },
      checkIfExists: true,
      relations: ['loan'],
    });

    return existingMovement;
  }
}
