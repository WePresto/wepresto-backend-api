import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ConfigType } from '@nestjs/config';
import { Repository } from 'typeorm';

import appConfig from '../../../../config/app.config';

import { Loan, LoanStatus, LoanTerm } from '../loan.entity';
import { Movement, MovementType } from '../../movement/movement.entity';

import { BaseService } from '../../../../common/base.service';

import { getYearMonthDayFromDateISOString } from '../../../../utils/get-year-month-day-from-date-iso-string.util';
import { getNumberOfDays } from '../../../../utils';

import { GetOneLoanInput } from '../dto/get-one-loan-input.dto';
import { GetMinimumPaymentAmountOutput } from '../dto/get-minimum-payment-amount-output.dto';
import { GetManyLoansInput } from '../dto/get-many-loans-input.dto';
import { GetMinimumPaymentAmountInput } from '../dto/get-minimum-payment-amount-input.dto';
import { GetTotalPaymentAmountInput } from '../dto/get-total-payment-amount-input.dto';
import { GetTotalPaymentAmountOutput } from '../dto/get-total-payment-amount-output.dto';
import { GetFundedAmountInput } from '../dto/get-funded-amount-input.dto';

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
    input: GetMinimumPaymentAmountInput,
  ): Promise<GetMinimumPaymentAmountOutput> {
    const { uid, referenceDate } = input;

    const existingLoan = await this.getOne({ uid });

    const loanInstallmentsQuery = this.loanRepository
      .createQueryBuilder('loan')
      .innerJoinAndSelect('loan.movements', 'movement')
      .where('loan.id = :loanId', { loanId: existingLoan.id })
      .andWhere('movement.type = :movementType', {
        movementType: MovementType.LOAN_INSTALLMENT,
      })
      .andWhere('movement.paid = :paid', { paid: false })
      // .andWhere(`extract('year' from movement.due_date) <= :year`, { year })
      //.andWhere(`extract('month' from movement.due_date) <= :month`, { month })
      // .andWhere(`extract('day' from movement.due_date) <= :day`, { day, })
      .orderBy('movement.due_date', 'ASC')
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
      .orderBy('movement.due_date', 'ASC')
      .getOne();

    const [loanInstallmentsResult, overDueInterestsResult] = await Promise.all([
      loanInstallmentsQuery,
      overDueInterestsQuery,
    ]);
    // console.log('loanInstallmentsResult', loanInstallmentsResult);

    let mergedMovements = [];

    if (loanInstallmentsResult) {
      const filteredMovements = loanInstallmentsResult.movements.filter(
        (movement) => {
          // check if the movement is due
          if (movement.dueDate <= referenceDate) return true;

          // check if the movement is due in the next 5 days
          const diffInDays = getNumberOfDays(referenceDate, movement.dueDate);
          if (diffInDays < 5) {
            return true;
          }

          return false;
        },
      );

      mergedMovements = [...mergedMovements, ...filteredMovements];
    }
    if (overDueInterestsResult) {
      mergedMovements = [
        ...mergedMovements,
        ...overDueInterestsResult.movements,
      ];
    }

    // delete the duplicated movements by id
    const movements: Movement[] = mergedMovements
      .filter(
        (movement, index, self) =>
          index === self.findIndex((m) => m.id === movement.id),
      )
      .sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime());

    // console.log('movements', JSON.stringify(movements));

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

  public async getMany(input: GetManyLoansInput) {
    const { status } = input;

    const existingLoans = await this.loanRepository.find({
      where: {
        status,
      },
    });

    return existingLoans;
  }

  public getLoanTerms() {
    const loansTerms = Object.keys(LoanTerm)
      .map((key, i, selfArray) => {
        if (i < selfArray.length / 2) {
          return {
            name: selfArray[i + selfArray.length / 2]
              .split('_')
              .map(
                (word) => word[0].toUpperCase() + word.slice(1).toLowerCase(),
              )
              .join(' '),
            value: parseInt(key, 10),
          };
        }
      })
      .filter((item) => !!item);

    return loansTerms;
  }

  public async getTotalPaymentAmount(
    input: GetTotalPaymentAmountInput,
  ): Promise<GetTotalPaymentAmountOutput> {
    const { uid, referenceDate } = input;

    // query to get the unpaid movements
    const unpaidLoanInstallmentsQuery = this.loanRepository
      .createQueryBuilder('loan')
      .innerJoinAndSelect('loan.movements', 'movement')
      .where('loan.uid = :uid', { uid })
      .andWhere('movement.type = :movementType', {
        movementType: MovementType.LOAN_INSTALLMENT,
      })
      .andWhere('movement.paid = :paid', { paid: false })
      .getOne();

    // get the minimum payment amount and the unpaid movements
    const [minimumPaymentAmountResult, unpaidLoanInstallmentsResult] =
      await Promise.all([
        this.getMinimumPaymentAmount({ uid, referenceDate }),
        unpaidLoanInstallmentsQuery,
      ]);

    // from the unpaid movements, get the movements that are not in the minimum payment amount result
    const unpaidLoanInstallments = (
      unpaidLoanInstallmentsResult ? unpaidLoanInstallmentsResult.movements : []
    ).filter(
      (movement) =>
        !minimumPaymentAmountResult.movements.find((m) => m.id === movement.id),
    );

    const mergedMovements = [
      ...minimumPaymentAmountResult.movements,
      ...unpaidLoanInstallments,
    ];

    // delete the duplicated movements by id
    const movements: Movement[] = mergedMovements
      .filter(
        (movement, index, self) =>
          index === self.findIndex((m) => m.id === movement.id),
      )
      .sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime());

    const reducedMovements = unpaidLoanInstallments.reduce(
      (acc, movement) => {
        const { principal } = movement;

        return {
          totalAmount: acc.totalAmount + principal,
          interest: acc.interest,
          principal: acc.principal + principal,
          overDueInterest: acc.overDueInterest,
          paymentDate: movement.dueDate,
        };
      },
      {
        totalAmount: minimumPaymentAmountResult.totalAmount,
        interest: minimumPaymentAmountResult.interest,
        principal: minimumPaymentAmountResult.principal,
        overDueInterest: minimumPaymentAmountResult.overDueInterest,
        paymentDate: undefined,
      },
    );

    return {
      ...reducedMovements,
      movements,
    };
  }

  public async getLoansNeedingFunding(input: any) {
    const { take = '10', skip = '0' } = input;

    const [loans, count] = await this.loanRepository
      .createQueryBuilder('loan')
      .where('loan.status = :status', { status: LoanStatus.FUNDING })
      .take(+take)
      .skip(+skip)
      .getManyAndCount();

    return {
      count,
      loans: await Promise.all(
        loans.map(async (loan) => {
          const { uid, amount } = loan;

          const { fundedAmount } = await this.getFundedAmount({ uid });

          return {
            ...loan,
            fundedAmount: fundedAmount,
            remainingAmount: amount - fundedAmount,
            fundedPercentage: fundedAmount / amount,
          };
        }),
      ),
    };
  }

  public async getFundedAmount(input: GetFundedAmountInput) {
    const { uid } = input;

    const { fundedAmount } = await this.loanRepository
      .createQueryBuilder('loan')
      .select('COALESCE(SUM(loanParticipation.amount), 0)', 'fundedAmount')
      .leftJoin('loan.loanParticipations', 'loanParticipation')
      .where('loan.uid = :uid', { uid })
      .getRawOne();

    return {
      fundedAmount: +fundedAmount,
    };
  }
}
