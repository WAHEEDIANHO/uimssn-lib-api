import { MigrationInterface, QueryRunner } from "typeorm";

export class Init1775297076549 implements MigrationInterface {
    name = 'Init1775297076549'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."tbl_book_catalogues_categories_enum" AS ENUM('Islamic Books', 'Motivational Books', 'Business Books', 'Design Books', 'Final Year Project')`);
        await queryRunner.query(`CREATE TYPE "public"."tbl_book_catalogues_type_enum" AS ENUM('Physical', 'Digital')`);
        await queryRunner.query(`CREATE TYPE "public"."tbl_book_catalogues_fileformat_enum" AS ENUM('PDF', 'EPUB')`);
        await queryRunner.query(`CREATE TYPE "public"."tbl_book_catalogues_faculty_enum" AS ENUM('Faculty of Agriculture', 'Faculty of Arts', 'Faculty of Basic Medical Science', 'Faculty of Clinical Science', 'Faculty of Dentistry', 'Faculty of Economics and Management Science', 'Faculty of Environmental Design and Management', 'Faculty of Law', 'Faculty of Pharmacy', 'Faculty of Public Health', 'Faculty of Renewable Natural Resources', 'Faculty of Science', 'Faculty of Social Science', 'Faculty of Computing', 'Faculty of Technology', 'Faculty of Veterinary Medicine')`);
        await queryRunner.query(`CREATE TABLE "tbl_book_catalogues" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "title" character varying(255) NOT NULL, "author" character varying(255) NOT NULL, "categories" "public"."tbl_book_catalogues_categories_enum" array NOT NULL, "type" "public"."tbl_book_catalogues_type_enum" NOT NULL, "description" text NOT NULL, "coverImage" character varying(255) NOT NULL, "fileUrl" character varying(255) NOT NULL, "fileFormat" "public"."tbl_book_catalogues_fileformat_enum" NOT NULL, "projectLink" character varying(255), "faculty" "public"."tbl_book_catalogues_faculty_enum", "isAvailable" boolean DEFAULT true, "isLibrarianPick" boolean DEFAULT false, CONSTRAINT "PK_102186223b2ab3aee64785372d4" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_5748606f7a4bd7e036055cbe0f" ON "tbl_book_catalogues" ("title") `);
        await queryRunner.query(`CREATE INDEX "IDX_56cb3e7c7f610f31e8b9e668a9" ON "tbl_book_catalogues" ("author") `);
        await queryRunner.query(`CREATE INDEX "IDX_3739bbaeaf1e9160207aefc756" ON "tbl_book_catalogues" ("categories") `);
        await queryRunner.query(`CREATE TYPE "public"."tbl_users_gender_enum" AS ENUM('MALE', 'FEMALE')`);
        await queryRunner.query(`CREATE TYPE "public"."tbl_users_accountstatus_enum" AS ENUM('ACTIVE', 'INACTIVE', 'BLOCKED', 'DELETED', 'PENDING', 'VERIFIED', 'UNVERIFIED', 'SUSPENDED', 'REJECTED', 'APPROVED')`);
        await queryRunner.query(`CREATE TYPE "public"."tbl_users_usertype_enum" AS ENUM('ADMIN', 'SUPER_ADMIN', 'USER', 'GUEST')`);
        await queryRunner.query(`CREATE TABLE "tbl_users" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "username" character varying NOT NULL, "email" character varying NOT NULL, "password" character varying NOT NULL, "googleId" character varying, "facebookId" character varying, "dateOfBirth" character varying, "firstName" character varying, "lastName" character varying, "gender" "public"."tbl_users_gender_enum", "phoneNumber" character varying, "fullName" character varying NOT NULL, "isEmailVerified" boolean NOT NULL DEFAULT false, "accountStatus" "public"."tbl_users_accountstatus_enum" NOT NULL DEFAULT 'INACTIVE', "userType" "public"."tbl_users_usertype_enum" NOT NULL DEFAULT 'USER', "profilePicture" character varying, "isAdmin" boolean NOT NULL DEFAULT false, CONSTRAINT "UQ_22e9c745c648bad6b39c5d5b58e" UNIQUE ("username"), CONSTRAINT "UQ_d74ab662f9d3964f78b3416d5da" UNIQUE ("email"), CONSTRAINT "PK_bb1d884179b3e42514b36c01e4e" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "tbl_otps" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "otp" character varying NOT NULL, "email" character varying NOT NULL, "isUsed" boolean NOT NULL DEFAULT false, CONSTRAINT "PK_62fd44aa492a424b6dbd9dfbe4f" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "tbl_otps"`);
        await queryRunner.query(`DROP TABLE "tbl_users"`);
        await queryRunner.query(`DROP TYPE "public"."tbl_users_usertype_enum"`);
        await queryRunner.query(`DROP TYPE "public"."tbl_users_accountstatus_enum"`);
        await queryRunner.query(`DROP TYPE "public"."tbl_users_gender_enum"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_3739bbaeaf1e9160207aefc756"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_56cb3e7c7f610f31e8b9e668a9"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_5748606f7a4bd7e036055cbe0f"`);
        await queryRunner.query(`DROP TABLE "tbl_book_catalogues"`);
        await queryRunner.query(`DROP TYPE "public"."tbl_book_catalogues_faculty_enum"`);
        await queryRunner.query(`DROP TYPE "public"."tbl_book_catalogues_fileformat_enum"`);
        await queryRunner.query(`DROP TYPE "public"."tbl_book_catalogues_type_enum"`);
        await queryRunner.query(`DROP TYPE "public"."tbl_book_catalogues_categories_enum"`);
    }

}
