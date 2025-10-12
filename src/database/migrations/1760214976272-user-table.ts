import { MigrationInterface, QueryRunner } from "typeorm";

export class UserTable1760214976272 implements MigrationInterface {
    name = 'UserTable1760214976272'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."tbl_users_gender_enum" AS ENUM('MALE', 'FEMALE')`);
        await queryRunner.query(`CREATE TYPE "public"."tbl_users_accountstatus_enum" AS ENUM('ACTIVE', 'INACTIVE', 'BLOCKED', 'DELETED', 'PENDING', 'VERIFIED', 'UNVERIFIED', 'SUSPENDED', 'REJECTED', 'APPROVED')`);
        await queryRunner.query(`CREATE TYPE "public"."tbl_users_usertype_enum" AS ENUM('ADMIN', 'SUPER_ADMIN', 'USER', 'GUEST')`);
        await queryRunner.query(`CREATE TABLE "tbl_users" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "username" character varying NOT NULL, "email" character varying NOT NULL, "password" character varying NOT NULL, "googleId" character varying, "facebookId" character varying, "dateOfBirth" character varying, "firstName" character varying, "lastName" character varying, "gender" "public"."tbl_users_gender_enum", "phoneNumber" character varying, "isPhoneNumberVerified" boolean NOT NULL DEFAULT false, "fullName" character varying NOT NULL, "isEmailVerified" boolean NOT NULL DEFAULT false, "accountStatus" "public"."tbl_users_accountstatus_enum" NOT NULL DEFAULT 'INACTIVE', "userType" "public"."tbl_users_usertype_enum" NOT NULL DEFAULT 'USER', "profilePicture" character varying, "isAdmin" boolean NOT NULL DEFAULT false, "mfa_secret" character varying, "is_mfa_enabled" boolean NOT NULL DEFAULT false, "is_mfa_started" boolean NOT NULL DEFAULT false, "recovery_code" character varying, CONSTRAINT "UQ_22e9c745c648bad6b39c5d5b58e" UNIQUE ("username"), CONSTRAINT "UQ_d74ab662f9d3964f78b3416d5da" UNIQUE ("email"), CONSTRAINT "PK_bb1d884179b3e42514b36c01e4e" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "tbl_otps" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "otp" character varying NOT NULL, "email" character varying NOT NULL, "isUsed" boolean NOT NULL DEFAULT false, CONSTRAINT "PK_62fd44aa492a424b6dbd9dfbe4f" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "tbl_otps"`);
        await queryRunner.query(`DROP TABLE "tbl_users"`);
        await queryRunner.query(`DROP TYPE "public"."tbl_users_usertype_enum"`);
        await queryRunner.query(`DROP TYPE "public"."tbl_users_accountstatus_enum"`);
        await queryRunner.query(`DROP TYPE "public"."tbl_users_gender_enum"`);
    }

}
