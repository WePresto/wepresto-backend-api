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

import { Loan } from '../loan/loan.entity';

export enum MovementType {
  LOAN_INSTALLMENT = 'LOAN_INSTALLMENT',
  OVERDUE_INTEREST = 'OVERDUE_INTEREST',
  PAYMENT = 'PAYMENT',
  PAYMENT_TERM_REDUCTION = 'PAYMENT_TERM_REDUCTION',
  PAYMENT_INSTALLMENT_AMOUNT_REDUCTION = 'PAYMENT_INSTALLMENT_AMOUNT_REDUCTION',
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
      from: (value: string) =>
        value === null || value === undefined ? value : parseFloat(value),
      to: (value: number) => value,
    },
  })
  amount: number;

  @Column({
    type: 'decimal',
    precision: 15,
    scale: 3,
    nullable: true,
    transformer: {
      from: (value: string) =>
        value === null || value === undefined ? value : parseFloat(value),
      to: (value: number) => value,
    },
  })
  interest?: number;

  @Column({
    type: 'decimal',
    precision: 15,
    scale: 3,
    nullable: true,
    transformer: {
      from: (value: string) =>
        value === null || value === undefined ? value : parseFloat(value),
      to: (value: number) => value,
    },
  })
  principal?: number;

  @Column({
    type: 'decimal',
    precision: 15,
    scale: 3,
    nullable: true,
    transformer: {
      from: (value: string) =>
        value === null || value === undefined ? value : parseFloat(value),
      to: (value: number) => value,
    },
  })
  balance?: number;

  @Column({
    name: 'due_date',
    type: 'timestamptz',
    nullable: true,
  })
  dueDate?: Date;

  @Column({
    name: 'movement_date',
    type: 'timestamptz',
    nullable: true,
  })
  movementDate?: Date;

  @Column({
    type: 'boolean',
    default: null,
  })
  paid?: boolean;

  @Column({
    type: 'boolean',
    default: null,
  })
  processed?: boolean;

  @Column({
    type: 'varchar',
    default: null,
    nullable: true,
  })
  comment?: string;

  @Column({
    name: 'proof_url',
    type: 'text', // 'varchar
    default: null,
    nullable: true,
  })
  proofURL?: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'delete_at', type: 'timestamptz' })
  deleteAt?: Date;

  // relations

  @ManyToOne(() => Loan, (loan) => loan.movements, { nullable: false })
  @JoinColumn({ name: 'loan_id' })
  loan: Loan;
}
