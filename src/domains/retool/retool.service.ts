import { Inject, Injectable } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { InjectEntityManager } from '@nestjs/typeorm';
import { EntityManager } from 'typeorm';

import appConfig from '../../config/app.config';

import { LoanStatus } from '../loans/loan/loan.entity';
import { MovementType } from '../loans/movement/movement.entity';

import { getCommisionPercentageByCountry } from '../../utils/get-commision-percentage-by-country';

@Injectable()
export class RetoolService {
  constructor(
    @Inject(appConfig.KEY)
    private readonly appConfiguration: ConfigType<typeof appConfig>,
    @InjectEntityManager()
    private readonly entityManager: EntityManager,
  ) {}

  public async getLoans() {
    const loansQuery =
      'select l.id as loan_id, ' +
      'l.uid as loan_uid, ' +
      'l.start_date as loan_start_date, ' +
      'l.amount as loan_amount, ' +
      'l.term as loan_term, ' +
      'l.platform_fee as loan_platform_fee, ' +
      'u.full_name as borrower_full_name ' +
      'from loan l ' +
      'inner join borrower b on l.borrower_id = b.id ' +
      'inner join "user" u on b.user_id = u.id ' +
      'where 1 = 1 ' +
      `and l.status in ('${LoanStatus.DISBURSED}') ` +
      'order by l.start_date asc;';

    const movementsQuery =
      'select m.id as movement_id, ' +
      'm.loan_id as movement_loan_id, ' +
      'm.amount as movement_amount, ' +
      'm.type as movement_type, ' +
      'm.paid as movement_paid ' +
      'from movement m ' +
      'where 1 = 1 ' +
      'and m.delete_at is null';

    const [loans, movements] = await Promise.all([
      this.entityManager.query<any[]>(loansQuery),
      this.entityManager.query<any[]>(movementsQuery),
    ]);

    const response = loans.map((loan) => {
      const movementsTotalAmount = movements.reduce((pre, cur) => {
        if (cur.movement_loan_id === loan.loan_id) {
          if (cur.movement_type.includes(MovementType.PAYMENT)) {
            return pre + Math.abs(+cur.movement_amount);
          } else if (
            cur.movement_type === MovementType.LOAN_INSTALLMENT &&
            !cur.movement_paid
          ) {
            return pre + +cur.movement_amount;
          } else if (
            cur.movement_type === MovementType.OVERDUE_INTEREST &&
            !cur.movement_paid
          ) {
            return pre + +cur.movement_amount;
          }
        }
        return pre;
      }, 0);

      const movementEarnings =
        movementsTotalAmount * getCommisionPercentageByCountry('CO');

      return {
        ...loan,
        loan_expected_earnings: +loan.loan_platform_fee + movementEarnings,
      };
    });

    return response;
  }
}
