import { MigrationInterface, QueryRunner } from 'typeorm';

export class alterMovementTable1678943715947 implements MigrationInterface {
  name = 'alterMovementTable1678943715947';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "movement" DROP COLUMN "interest_amount"`,
    );
    await queryRunner.query(`ALTER TABLE "movement" DROP COLUMN "start_date"`);
    await queryRunner.query(`ALTER TABLE "movement" DROP COLUMN "end_date"`);
    await queryRunner.query(
      `ALTER TABLE "movement" ADD "interest" numeric(15,3)`,
    );
    await queryRunner.query(
      `ALTER TABLE "movement" ADD "principal" numeric(15,3)`,
    );
    await queryRunner.query(
      `ALTER TABLE "movement" ADD "balance" numeric(15,3)`,
    );
    await queryRunner.query(
      `ALTER TABLE "movement" ADD "due_date" TIMESTAMP WITH TIME ZONE`,
    );
    await queryRunner.query(
      `ALTER TABLE "movement" ADD "movement_date" TIMESTAMP WITH TIME ZONE`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "movement" DROP COLUMN "movement_date"`,
    );
    await queryRunner.query(`ALTER TABLE "movement" DROP COLUMN "due_date"`);
    await queryRunner.query(`ALTER TABLE "movement" DROP COLUMN "balance"`);
    await queryRunner.query(`ALTER TABLE "movement" DROP COLUMN "principal"`);
    await queryRunner.query(`ALTER TABLE "movement" DROP COLUMN "interest"`);
    await queryRunner.query(
      `ALTER TABLE "movement" ADD "end_date" TIMESTAMP WITH TIME ZONE NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "movement" ADD "start_date" TIMESTAMP WITH TIME ZONE NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "movement" ADD "interest_amount" numeric(15,3) NOT NULL`,
    );
  }
}
