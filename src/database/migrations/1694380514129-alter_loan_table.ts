import { MigrationInterface, QueryRunner } from 'typeorm';

export class AlterLoanTable1694380514129 implements MigrationInterface {
  name = 'AlterLoanTable1694380514129';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "loan" ADD "consecutive" character varying(20)`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "loan" DROP COLUMN "consecutive"`);
  }
}
