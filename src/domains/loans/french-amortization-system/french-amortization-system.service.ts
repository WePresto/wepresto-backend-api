import { Inject, Injectable } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';

import appConfig from '../../../config/app.config';

import { addDays } from '../../../utils';

import { GetLoanInstallmentsInput } from './dto/get-loan-installments-input.dto';
import { GetLoanInstallmentsOutput } from './dto/get-loan-installments-output.dto';

@Injectable()
export class FrenchAmortizationSystemService {
  constructor(
    @Inject(appConfig.KEY)
    private readonly appConfiguration: ConfigType<typeof appConfig>,
  ) {}

  public getLoanInstallments(
    input: GetLoanInstallmentsInput,
  ): GetLoanInstallmentsOutput[] {
    const { amount, annualInterestRate, term, referenceDate } = input;

    const P = amount; // loan amount
    const i = annualInterestRate / 12; // monthly interest rate
    const n = term; // number of payments (months)
    let C = 0;

    // calculate the monthly payment amount
    C = (P * i) / (1 - Math.pow(1 + i, -n));

    let installments: GetLoanInstallmentsOutput[] = [];

    // Calculate the amortization of each payment and display it in the console
    let balance = P;
    for (let j = 0; j < n; j++) {
      const interest = balance * i;
      const principal = C - interest;
      balance -= principal;

      let dueDate;
      if (j === 0) {
        dueDate = addDays(referenceDate, 30);
      } else {
        dueDate = addDays(installments[j - 1].dueDate, 30);
      }

      installments = [
        ...installments,
        {
          order: j,
          amount: parseFloat((interest + principal).toFixed(3)),
          interest: parseFloat(interest.toFixed(3)),
          principal: parseFloat(principal.toFixed(3)),
          balance: parseFloat(balance.toFixed(3)),
          dueDate,
        },
      ];
    }

    return installments;
  }
}
