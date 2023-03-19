import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ConfigType } from '@nestjs/config';
import { Repository } from 'typeorm';

import appConfig from '../../../../config/app.config';

import { Loan } from '../loan.entity';
import { Movement, MovementType } from '../../movement/movement.entity';

import { BaseService } from '../../../../common/base.service';

import { GetOneLoanInput } from '../dto/get-one-loan-input.dto';
import { GetMinimumPaymentAmountOutput } from '../dto/get-minimum-payment-amount-output.dto';

@Injectable()
export class LoanReadService extends BaseService<Loan> {
  constructor(
    @Inject(appConfig.KEY)
    private readonly appConfiguration: ConfigType<typeof appConfig>,
    @InjectRepository(Loan)
    private readonly loanRepository: Repository<Loan>,
  ) {
    super(loanRepository);
  }

  public async getOne(input: GetOneLoanInput): Promise<Loan> {
    const { uid } = input;

    const existingLoan = await this.getOneByFields({
      fields: {
        uid,
      },
      checkIfExists: true,
      loadRelationIds: false,
    });

    return existingLoan;
  }

  public async getMinimumPaymentAmount(
    input: GetOneLoanInput,
  ): Promise<GetMinimumPaymentAmountOutput> {
    const { uid } = input;

    const existingLoan = await this.getOne({ uid });

    // eslint-disable-next-line no-console
    console.log('going to create the date...');

    const localeDateString = new Date().toLocaleDateString('en-US', {
      timeZone: 'America/Bogota',
    });

    // eslint-disable-next-line no-console
    console.log('localeDateString', localeDateString);

    const referenceDateTime = new Date(localeDateString).toISOString();

    // eslint-disable-next-line no-console
    console.log('referenceDateTime', referenceDateTime);

    const [referenceDate] = referenceDateTime.split('T');

    const [year, month] = referenceDate.split('-');

    const nextLoanInstallmentQuery = this.loanRepository
      .createQueryBuilder('loan')
      .innerJoinAndSelect('loan.movements', 'movement')
      .where('loan.id = :loanId', { loanId: existingLoan.id })
      .andWhere('movement.type = :movementType', {
        movementType: MovementType.LOAN_INSTALLMENT,
      })
      .andWhere('movement.paid = :paid', { paid: false })
      .andWhere(`(movement.due_date - interval '10 day') < :referenceDate`, {
        referenceDate,
      })
      .getOne();

    const loanInstallmentsQuery = this.loanRepository
      .createQueryBuilder('loan')
      .innerJoinAndSelect('loan.movements', 'movement')
      .where('loan.id = :loanId', { loanId: existingLoan.id })
      .andWhere('movement.type = :movementType', {
        movementType: MovementType.LOAN_INSTALLMENT,
      })
      .andWhere('movement.paid = :paid', { paid: false })
      .andWhere(`extract('year' from movement.due_date) <= :year`, { year })
      .andWhere(`extract('month' from movement.due_date) <= :month`, { month })
      .getOne();

    const overDueInterestsQuery = this.loanRepository
      .createQueryBuilder('loan')
      .innerJoinAndSelect('loan.movements', 'movement')
      .where('loan.id = :loanId', { loanId: existingLoan.id })
      .andWhere('movement.type = :movementType', {
        movementType: MovementType.OVERDUE_INTEREST,
      })
      .andWhere('movement.paid = :paid', { paid: false })
      .andWhere('movement.due_date <= :referenceDate', { referenceDate })
      .getOne();

    const [
      nextLoanInstallmentResult,
      loanInstallmentsResult,
      overDueInterestsResult,
    ] = await Promise.all([
      nextLoanInstallmentQuery,
      loanInstallmentsQuery,
      overDueInterestsQuery,
    ]);

    let mergedMovements = [];

    if (nextLoanInstallmentResult) {
      mergedMovements = [
        ...mergedMovements,
        ...nextLoanInstallmentResult.movements,
      ];
    }
    if (loanInstallmentsResult) {
      mergedMovements = [
        ...mergedMovements,
        ...loanInstallmentsResult.movements,
      ];
    }
    if (overDueInterestsResult) {
      mergedMovements = [
        ...mergedMovements,
        ...overDueInterestsResult.movements,
      ];
    }

    // delete the duplicated movements by id
    const movements: Movement[] = mergedMovements.filter(
      (movement, index, self) =>
        index === self.findIndex((m) => m.id === movement.id),
    );

    const reducedMovements = movements.reduce(
      (acc, movement) => {
        const { amount, interest, principal, type } = movement;

        return {
          totalAmount: acc.totalAmount + amount,
          interest: acc.interest + interest,
          principal: acc.principal + principal,
          overDueInterest:
            acc.overDueInterest +
            (type === MovementType.OVERDUE_INTEREST ? amount : 0),
          paymentDate: acc.paymentDate || movement.dueDate,
        };
      },
      {
        totalAmount: 0,
        interest: 0,
        principal: 0,
        overDueInterest: 0,
        paymentDate: undefined,
      },
    );

    return {
      ...reducedMovements,
      movements,
    };
  }
}
