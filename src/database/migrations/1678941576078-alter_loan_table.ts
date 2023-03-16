import { MigrationInterface, QueryRunner } from 'typeorm';

export class alterLoanTable1678941576078 implements MigrationInterface {
  name = 'alterLoanTable1678941576078';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "loan" RENAME COLUMN "loan_term" TO "term"`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "loan" RENAME COLUMN "term" TO "loan_term"`,
    );
  }
}
