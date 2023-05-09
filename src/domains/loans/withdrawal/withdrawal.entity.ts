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

export enum WithdrawalStatus {
  REQUESTED = 'REQUESTED',
  IN_PROGRESS = 'IN_PROGRESS',
  ERROR = 'ERROR',
  COMPLETED = 'COMPLETED',
}

@Entity({ name: 'withdrawal' })
@Unique('uk_withdrawal_uid', ['uid'])
export class Withdrawal extends BaseEntity {
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
      from: (value: string) =>
        value === null || value === undefined ? value : parseFloat(value),
      to: (value: number) => value,
    },
  })
  amount: number;

  @Column({
    name: 'deposit_amount',
    type: 'decimal',
    precision: 15,
    scale: 3,
    transformer: {
      from: (value: string) =>
        value === null || value === undefined ? value : parseFloat(value),
      to: (value: number) => value,
    },
  })
  depositAmount: number;

  @Column({
    name: 'comission_amount',
    type: 'decimal',
    precision: 15,
    scale: 3,
    transformer: {
      from: (value: string) =>
        value === null || value === undefined ? value : parseFloat(value),
      to: (value: number) => value,
    },
  })
  comissionAmount: number;

  @Column({
    type: 'varchar',
    length: 100,
  })
  status: string;

  @Column({
    name: 'account_info',
    type: 'json',
  })
  accountInfo: any;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;

  // relations

  @ManyToOne(() => Lender, (lender) => lender.loanParticipations)
  @JoinColumn({ name: 'lender_id' })
  lender: Lender;
}
