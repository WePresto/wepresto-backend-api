import { BadRequestException, ConflictException, Inject } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import appConfig from '../../../../config/app.config';

import { Movement, MovementType } from '../movement.entity';

import { BaseService } from '../../../../common/base.service';
import { LoanService } from '../../loan/services/loan.service';

import { GetOneMovementInput } from '../dto/get-one-movement-input.dto';
import { GetLoanMovementsInput } from '../dto/get-loan-movements-input.dto';

export class MovementReadService extends BaseService<Movement> {
  constructor(
    @Inject(appConfig.KEY)
    private readonly appConfiguration: ConfigType<typeof appConfig>,
    @InjectRepository(Movement)
    private readonly movementRepository: Repository<Movement>,
    private readonly loanService: LoanService,
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

  public async getLoanMovements(input: GetLoanMovementsInput) {
    const {
      loanUid,
      take = '10',
      skip = '0',
      types,
      startDate,
      endDate,
    } = input;

    let parsedTypes = [];
    if (types) {
      parsedTypes = types.split(',').map((type) => type.trim());

      // check if the types are valid
      parsedTypes.forEach((type) => {
        if (!Object.values(MovementType).includes(type as MovementType)) {
          throw new BadRequestException(`invalid movement type ${type}`);
        }
      });
    }

    let parsedStartDate: Date | undefined;
    if (startDate) {
      parsedStartDate = new Date(startDate);
    }

    let parsedEndDate: Date | undefined;
    if (endDate) {
      parsedEndDate = new Date(endDate);
    }

    // get the loan
    const existingLoan = await this.loanService.readService.getOneByFields({
      fields: {
        uid: loanUid,
      },
      checkIfExists: true,
      loadRelationIds: false,
    });

    const query = this.movementRepository
      .createQueryBuilder('movement')
      .innerJoin('movement.loan', 'loan')
      .where('loan.uid = :loanUid', { loanUid: existingLoan.uid });

    if (parsedTypes.length) {
      query.andWhere('movement.type IN (:...types)', { types: parsedTypes });
    }

    const [movements, count] = await query.getManyAndCount();

    // order movements by date
    const orderedMovements = movements
      .filter((movement) => {
        const movementDate = movement.dueDate ?? movement.movementDate;

        if (parsedStartDate && parsedEndDate) {
          return (
            movementDate.getTime() >= parsedStartDate.getTime() &&
            movementDate.getTime() <= parsedEndDate.getTime()
          );
        }

        if (parsedStartDate) {
          return movementDate.getTime() >= parsedStartDate.getTime();
        }

        if (parsedEndDate) {
          return movementDate.getTime() <= parsedEndDate.getTime();
        }

        return true;
      })
      .sort((a, b) => {
        const aDate = a.dueDate ?? a.movementDate;
        const bDate = b.dueDate ?? b.movementDate;

        return aDate.getTime() - bDate.getTime();
      })
      .slice(+skip, +skip + +take);

    return {
      count,
      movements: orderedMovements,
    };
  }
}
