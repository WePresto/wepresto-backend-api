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

import { Lender } from '../../users/lender/lender.entity';
import { Loan } from '../loan/loan.entity';

@Entity({ name: 'loan_participation' })
@Unique('uk_loan_participation_uid', ['uid'])
export class LoanParticipation extends BaseEntity {
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

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;

  // relations

  @ManyToOne(() => Lender, (lender) => lender.loanParticipations)
  @JoinColumn({ name: 'lender_id' })
  lender: Lender;

  @ManyToOne(() => Loan, (loan) => loan.loanParticipations)
  @JoinColumn({ name: 'loan_id' })
  loan: Loan;
}
