import {
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

@Entity({ name: 'loan' })
@Unique('uk_loan_uid', ['uid'])
export class Loan extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Generated('uuid')
  @Column()
  uid: string;

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
    name: 'annual_interest_rate',
    type: 'decimal',
    precision: 5,
    scale: 3,
    transformer: {
      from: (value: string) => parseFloat(value),
      to: (value: number) => value,
    },
  })
  annualInterestRate: number;

  @Column({
    name: 'annual_interest_overdue_rate',
    type: 'decimal',
    precision: 5,
    scale: 3,
    transformer: {
      from: (value: string) => parseFloat(value),
      to: (value: number) => value,
    },
  })
  annualInterestOverdueRate: number;

  @Column({
    name: 'term',
    type: 'int',
  })
  term: number;

  @Column({
    name: 'start_date',
    type: 'timestamptz',
  })
  startDate: Date;

  @Column({
    type: 'boolean',
    default: false,
  })
  paid?: boolean;

  @Column({
    type: 'varchar',
    default: null,
  })
  description?: string;

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
    (loanParticipation) => loanParticipation.lender,
  )
  loanParticipations: LoanParticipation[];
}
