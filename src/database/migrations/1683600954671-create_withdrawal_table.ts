import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateWithdrawalTable1683600954671 implements MigrationInterface {
  name = 'CreateWithdrawalTable1683600954671';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "withdrawal" ("id" SERIAL NOT NULL, "uid" uuid NOT NULL DEFAULT uuid_generate_v4(), "amount" numeric(15,3) NOT NULL, "deposit_amount" numeric(15,3) NOT NULL, "comission_amount" numeric(15,3) NOT NULL, "status" character varying(100) NOT NULL, "account_info" json NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "lender_id" integer, CONSTRAINT "uk_withdrawal_uid" UNIQUE ("uid"), CONSTRAINT "PK_840e247aaad3fbd4e18129122a2" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "withdrawal" ADD CONSTRAINT "FK_ae2e2a5485283bd1d4e5c964098" FOREIGN KEY ("lender_id") REFERENCES "lender"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "withdrawal" DROP CONSTRAINT "FK_ae2e2a5485283bd1d4e5c964098"`,
    );
    await queryRunner.query(`DROP TABLE "withdrawal"`);
  }
}
