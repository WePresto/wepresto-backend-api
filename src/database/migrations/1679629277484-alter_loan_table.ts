import { MigrationInterface, QueryRunner } from 'typeorm';

export class alterLoanTable1679629277484 implements MigrationInterface {
  name = 'alterLoanTable1679629277484';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "loan" ADD "alias" character varying`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "loan" DROP COLUMN "alias"`);
  }
}
