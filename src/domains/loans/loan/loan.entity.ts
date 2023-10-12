import {
  AfterInsert,
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  Generated,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';

import { Borrower } from '../../users/borrower/borrower.entity';
import { Movement } from '../movement/movement.entity';
import { LoanParticipation } from '../loan-participation/loan-participation.entity';
import { PaymentAttempt } from '../../payments/payment-attempt/payment-attempt.entity';
import { Logger } from '@nestjs/common';

export enum LoanStatus {
  APPLIED = 'APPLIED',
  REVIEWING = 'REVIEWING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  FUNDING = 'FUNDING',
  DISBURSED = 'DISBURSED',
  PAID = 'PAID',
}

export enum LoanTerm {
  SIX = 6,
  TWELVE = 12,
  EIGHTEEN = 18,
  TWENTY_FOUR = 24,
  THIRTY_SIX = 36,
}

export const InterstRate = {
  [LoanTerm.SIX]: 0.2,
  [LoanTerm.TWELVE]: 0.25,
  [LoanTerm.EIGHTEEN]: 0.3,
  [LoanTerm.TWENTY_FOUR]: 0.35,
  [LoanTerm.THIRTY_SIX]: 0.4,
};
@Entity({ name: 'loan' })
@Unique('uk_loan_uid', ['uid'])
export class Loan extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Generated('uuid')
  @Column()
  uid: string;

  @Column({
    type: 'varchar',
    length: 20,
    nullable: true,
  })
  consecutive: string;

  @Column({
    type: 'decimal',
    precision: 15,
    scale: 3,
    transformer: {
      from: (value: string) =>
        value === null || value === undefined ? value : parseFloat(value),
      to: (value: number) => value,
    },
    nullable: true,
  })
  amount: number;

  @Column({
    name: 'annual_interest_rate',
    type: 'decimal',
    precision: 5,
    scale: 3,
    transformer: {
      from: (value: string) =>
        value === null || value === undefined ? value : parseFloat(value),
      to: (value: number) => value,
    },
    nullable: true,
  })
  annualInterestRate?: number;

  @Column({
    name: 'annual_interest_overdue_rate',
    type: 'decimal',
    precision: 5,
    scale: 3,
    transformer: {
      from: (value: string) =>
        value === null || value === undefined ? value : parseFloat(value),
      to: (value: number) => value,
    },
    nullable: true,
  })
  annualInterestOverdueRate?: number;

  @Column({
    name: 'term',
    type: 'int',
    nullable: true,
  })
  term?: number;

  @Column({
    name: 'start_date',
    type: 'timestamptz',
    nullable: true,
  })
  startDate?: Date;

  @Column({
    type: 'varchar',
    length: 20,
    nullable: true,
  })
  status?: string;

  @Column({
    type: 'varchar',
    default: null,
  })
  comment?: string;

  @Column({
    type: 'varchar',
    nullable: true,
  })
  alias?: string;

  @Column({
    name: 'platform_fee',
    type: 'decimal',
    precision: 15,
    scale: 3,
    transformer: {
      from: (value: string) =>
        value === null || value === undefined ? value : parseFloat(value),
      to: (value: number) => value,
    },
    nullable: true,
    default: 0,
  })
  platformFee?: number;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;

  // relations

  @ManyToOne(() => Borrower, (borrower) => borrower.loans, { nullable: true })
  @JoinColumn({ name: 'borrower_id' })
  borrower: Borrower;

  @OneToMany(() => Movement, (movement) => movement.loan, { cascade: true })
  movements: Movement[];

  @OneToMany(
    () => LoanParticipation,
    (loanParticipation) => loanParticipation.loan,
  )
  loanParticipations: LoanParticipation[];

  @OneToMany(
    () => LoanParticipation,
    (loanParticipation) => loanParticipation.lender,
  )
  paymentAttempts: PaymentAttempt[];

  @AfterInsert()
  setConecutive() {
    Logger.log('AfterInsert', Loan.name + '.setConecutive');
    this.consecutive = `WE-${this.id}`;
    Logger.log(`AfterInsert ${this.consecutive}`, Loan.name + '.setConecutive');
  }
}
