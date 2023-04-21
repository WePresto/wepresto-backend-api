import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreatePaymentAttemptTable1681949475447
  implements MigrationInterface
{
  name = 'CreatePaymentAttemptTable1681949475447';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "payment_attempt" ("id" SERIAL NOT NULL, "uid" uuid NOT NULL DEFAULT uuid_generate_v4(), "platform" character varying(50) NOT NULL, "identifier" character varying(100) NOT NULL, "amount" numeric(15,3) NOT NULL, "status" character varying(50) NOT NULL, "messageId" character varying(50) NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "loan_id" integer NOT NULL, CONSTRAINT "uk_payment_attempt_identifier" UNIQUE ("uid"), CONSTRAINT "uk_payment_attempt_uid" UNIQUE ("uid"), CONSTRAINT "PK_a5ce3945d1d61956161e7f84d42" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "payment_attempt" ADD CONSTRAINT "FK_733a668375b3e9b4ef9275bc2a0" FOREIGN KEY ("loan_id") REFERENCES "loan"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "payment_attempt" DROP CONSTRAINT "FK_733a668375b3e9b4ef9275bc2a0"`,
    );
    await queryRunner.query(`DROP TABLE "payment_attempt"`);
  }
}
