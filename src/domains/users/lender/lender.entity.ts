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
import { LoanParticipation } from '../../../domains/loans/loan-participation/loan-participation.entity';

@Entity({ name: 'lender' })
@Unique('uk_lender_uid', ['uid'])
export class Lender extends BaseEntity {
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
  @OneToOne(() => User, (user) => user.lender)
  user: User;

  @OneToMany(
    () => LoanParticipation,
    (loanParticipation) => loanParticipation.lender,
  )
  loanParticipations: LoanParticipation[];
}
