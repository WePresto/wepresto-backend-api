import { MigrationInterface, QueryRunner } from 'typeorm';

export class AlterLoanTable1684356692417 implements MigrationInterface {
  name = 'AlterLoanTable1684356692417';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "loan" ADD "platform_fee" numeric(15,3) DEFAULT '0'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "loan" DROP COLUMN "platform_fee"`);
  }
}
