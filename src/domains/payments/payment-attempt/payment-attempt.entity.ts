import {
  BaseEntity,
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Generated,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';

import { Loan } from '../../loans/loan/loan.entity';

export enum MovementType {
  LOAN_INSTALLMENT = 'LOAN_INSTALLMENT',
  OVERDUE_INTEREST = 'OVERDUE_INTEREST',
  PAYMENT = 'PAYMENT',
  PAYMENT_TERM_REDUCTION = 'PAYMENT_TERM_REDUCTION',
  PAYMENT_INSTALLMENT_AMOUNT_REDUCTION = 'PAYMENT_INSTALLMENT_AMOUNT_REDUCTION',
}

@Entity({ name: 'payment_attempt' })
@Unique('uk_payment_attempt_uid', ['uid'])
@Unique('uk_payment_attempt_identifier', ['uid'])
export class PaymentAttempt extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Generated('uuid')
  @Column()
  uid: string;

  @Column({
    type: 'varchar',
    length: 50,
  })
  platform: string;

  @Column({
    type: 'varchar',
    length: 100,
  })
  identifier: string;

  @Column({
    type: 'decimal',
    precision: 15,
    scale: 3,
    transformer: {
      from: (value: string) =>
        value === null || value === undefined ? value : parseFloat(value),
      to: (value: number) => value,
    },
  })
  amount: number;

  @Column({
    type: 'varchar',
    length: 50,
  })
  status: string;

  @Column({
    type: 'varchar',
    length: 50,
  })
  messageId: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;

  // relations

  @ManyToOne(() => Loan, (loan) => loan.movements, { nullable: false })
  @JoinColumn({ name: 'loan_id' })
  loan: Loan;
}
