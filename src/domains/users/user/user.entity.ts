import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  OneToOne,
  // OneToMany,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';

import { Lender } from '../lender/lender.entity';
import { Borrower } from '../borrower/borrower.entity';

export enum DocumentType {
  CEDULA_CIUDADANIA = 'CEDULA_CIUDADANIA',
  CEDULA_EXTRANJERIA = 'CEDULA_EXTRANJERIA',
  PASAPORTE = 'PASAPORTE',
}

export enum Country {
  COLOMBIA = 'COLOMBIA',
}

export enum City {
  CALI = 'CALI',
}

@Entity({ name: 'user' })
@Unique('uk_user_auth_uid', ['authUid'])
export class User extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'auth_uid', type: 'varchar', length: 100, nullable: true })
  authUid?: string;

  @Column({
    name: 'document_type',
    type: 'varchar',
    length: 20,
    nullable: true,
  })
  documentType?: string;

  @Column({
    name: 'document_number',
    type: 'varchar',
    length: 20,
    nullable: true,
  })
  documentNumber?: string;

  @Column({ name: 'full_name', type: 'varchar', length: 160, nullable: true })
  fullName?: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  email?: string;

  @Column({ name: 'phone_number', type: 'varchar', length: 13, nullable: true })
  phoneNumber?: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  country?: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  city?: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  address?: string;

  @Column({ name: 'fcm_token', type: 'varchar', length: 255, nullable: true })
  fcmToken?: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;

  // relations

  @OneToOne(() => Lender, (lender) => lender.user, { cascade: true })
  lender: Lender;

  @OneToOne(() => Borrower, (borrower) => borrower.user, { cascade: true })
  borrower: Borrower;

  /*
  @OneToMany(() => Loan, (loan) => loan.user)
  loanRequests: LoanRequest[];
  */
}
