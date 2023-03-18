import { MigrationInterface, QueryRunner } from 'typeorm';

export class alterLoanTable1679093206826 implements MigrationInterface {
  name = 'alterLoanTable1679093206826';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "loan" DROP COLUMN "paid"`);
    await queryRunner.query(`ALTER TABLE "loan" DROP COLUMN "description"`);
    await queryRunner.query(
      `ALTER TABLE "loan" ADD "status" character varying(20)`,
    );
    await queryRunner.query(
      `ALTER TABLE "loan" ADD "comment" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "loan" ALTER COLUMN "amount" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "loan" ALTER COLUMN "annual_interest_rate" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "loan" ALTER COLUMN "annual_interest_overdue_rate" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "loan" ALTER COLUMN "term" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "loan" ALTER COLUMN "start_date" DROP NOT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "loan" ALTER COLUMN "start_date" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "loan" ALTER COLUMN "term" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "loan" ALTER COLUMN "annual_interest_rate" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "loan" ALTER COLUMN "annual_interest_overdue_rate" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "loan" ALTER COLUMN "amount" SET NOT NULL`,
    );
    await queryRunner.query(`ALTER TABLE "loan" DROP COLUMN "comment"`);
    await queryRunner.query(`ALTER TABLE "loan" DROP COLUMN "status"`);
    await queryRunner.query(
      `ALTER TABLE "loan" ADD "description" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "loan" ADD "paid" boolean NOT NULL DEFAULT false`,
    );
  }
}
