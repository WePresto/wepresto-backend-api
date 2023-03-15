import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  Generated,
  JoinColumn,
  OneToMany,
  OneToOne,
  // OneToMany,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../user/user.entity';

import { Loan } from '../../loans/loan/loan.entity';
// import { LoanRequest } from '../loan-request/loan-request.entity';

@Entity({ name: 'borrower' })
@Unique('uk_borrower_uid', ['uid'])
export class Borrower extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Generated('uuid')
  @Column()
  uid?: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;

  // relations

  @JoinColumn({ name: 'user_id' })
  @OneToOne(() => User, (user) => user.borrower)
  user: User;

  @OneToMany(() => Loan, (loan) => loan.borrower)
  loans: Loan[];
}
