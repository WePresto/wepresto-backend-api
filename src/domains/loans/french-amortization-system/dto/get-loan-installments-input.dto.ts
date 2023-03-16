export class GetLoanInstallmentsInput {
  /**
   * Amount of the loan
   *
   * @type {number}
   * @memberof GetLoanInstallmentsInput
   */
  readonly amount: number;

  /**
   * Annual interest rate of the loan (the percentage must be divided by 100)
   * Example: 5% = 0.05
   *
   * @type {number}
   * @memberof GetLoanInstallmentsInput
   */
  readonly annualInterestRate: number;

  /**
   * Number of months or installments of the loan
   *
   * @type {number}
   * @memberof GetLoanInstallmentsInput
   */
  readonly term: number;

  /**
   * Start date of the loan
   *
   * @type {Date}
   * @memberof GetLoanInstallmentsInput
   */
  readonly referenceDate: Date;
}
