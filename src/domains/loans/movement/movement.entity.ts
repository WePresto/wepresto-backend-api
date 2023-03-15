import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  Generated,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';

import { Loan } from '../loan/loan.entity';

export enum MovementType {
  LOAN_INSTALLMENT = 'LOAN_INSTALLMENT',
  OVERDUE_INTEREST = 'OVERDUE_INTEREST',
  PAYMENT = 'PAYMENT',
}

@Entity({ name: 'movement' })
@Unique('uk_movement_uid', ['uid'])
export class Movement extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Generated('uuid')
  @Column()
  uid: string;

  @Column({
    type: 'varchar',
    length: 50,
  })
  type: string;

  @Column({
    type: 'decimal',
    precision: 15,
    scale: 3,
    transformer: {
      from: (value: string) => parseFloat(value),
      to: (value: number) => value,
    },
  })
  amount: number;

  @Column({
    name: 'interest_amount',
    type: 'decimal',
    precision: 15,
    scale: 3,
    transformer: {
      from: (value: string) => parseFloat(value),
      to: (value: number) => value,
    },
  })
  interestAmount: number;

  @Column({
    name: 'start_date',
    type: 'timestamptz',
  })
  startDate: Date;

  @Column({
    name: 'end_date',
    type: 'timestamptz',
  })
  endDate: Date;

  @Column({
    type: 'boolean',
    default: null,
  })
  paid?: boolean;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;

  // relations

  @ManyToOne(() => Loan, (loan) => loan.movements, { nullable: false })
  @JoinColumn({ name: 'loan_id' })
  loan: Loan;
}
