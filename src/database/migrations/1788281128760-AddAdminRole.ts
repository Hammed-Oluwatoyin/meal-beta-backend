import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddAdminRole1788281128760 implements MigrationInterface {
  name = 'AddAdminRole1788281128760';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TYPE "public"."users_role_enum" ADD VALUE IF NOT EXISTS 'ADMIN'`,
    );
  }

  public async down(): Promise<void> {
    // Postgres does not support removing a value from an enum type.
    // Reverting this migration requires recreating the enum without 'ADMIN'
    // and is intentionally left as a manual operation.
  }
}
