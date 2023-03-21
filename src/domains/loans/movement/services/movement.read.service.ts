import { ConflictException, Inject } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import appConfig from '../../../../config/app.config';

import { Movement, MovementType } from '../movement.entity';

import { BaseService } from '../../../../common/base.service';
import { LoanService } from '../../loan/services/loan.service';

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

  public async getLoanInstallmentInfo(input: GetOneMovementInput) {
    const { uid } = input;

    const existingLoanInstallment = await this.getOneByFields({
      fields: {
        uid,
      },
      checkIfExists: true,
      relations: ['loan'],
    });

    if (existingLoanInstallment.type !== MovementType.LOAN_INSTALLMENT) {
      throw new ConflictException(`movement ${uid} is not a loan installment`);
    }

    const { loan } = existingLoanInstallment;

    // query to get all loan installments
    const query = this.movementRepository
      .createQueryBuilder('movement')
      .where('movement.loan = :loanId', { loanId: loan.id })
      .andWhere('movement.type = :movementType', {
        movementType: MovementType.LOAN_INSTALLMENT,
      });

    const movements = await query.getMany();

    // determine the index of the existing loan installment
    const existingLoanInstallmentIndex = movements.findIndex(
      (movement) => movement.uid === uid,
    );

    return {
      id: existingLoanInstallment.id,
      uid: existingLoanInstallment.uid,
      amount: existingLoanInstallment.amount,
      interest: existingLoanInstallment.interest,
      principal: existingLoanInstallment.principal,
      balance: existingLoanInstallment.balance,
      order: existingLoanInstallmentIndex + 1,
      numberOfInstallments: movements.length,
      paid: existingLoanInstallment.paid,
    };
  }
}
