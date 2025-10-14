import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  Entity,
} from 'typeorm';
import { IEntity } from '@uimssn/base_module/utils/abstract/database/i-enity';
import { DbEntity } from '@uimssn/base_module/utils/abstract/database/db-entity';
import { GenderEnum } from '@uimssn/base_module/user/enums/gender.enum';
import { AccountStatusEnum } from '@uimssn/base_module/user/enums/account-status.enum';
import { RoleEnum } from '@uimssn/base_module/user/enums/role.enum';

export enum UserRole {
  ADMIN = 'admin',
  USER = 'user',
}

export enum UserGender {
  m = 'male',
  f = 'female',
}

@Entity({ name: 'tbl_users' })
export class User extends DbEntity implements IEntity {
  @Column({ nullable: false, unique: true })
  username: string;

  @Column({ nullable: false, unique: true })
  email: string;

  @Column({ nullable: false })
  password?: string;

  @Column({ type: 'varchar', nullable: true })
  googleId?: string;

  @Column({ type: 'varchar', nullable: true })
  facebookId?: string;

  @Column({ nullable: true })
  dateOfBirth: string;

  @Column({ nullable: true })
  firstName: string;

  @Column({ nullable: true })
  lastName: string;

  @Column({ type: 'enum', enum: GenderEnum, nullable: true })
  gender: GenderEnum;

  @Column({ nullable: true })
  phoneNumber: string;

  @Column({ default: false })
  isPhoneNumberVerified: boolean;

  @Column({ nullable: false })
  fullName: string;

  @Column({ default: false })
  isEmailVerified: boolean;

  @Column({
    type: 'enum',
    enum: AccountStatusEnum,
    default: AccountStatusEnum.INACTIVE,
  })
  accountStatus: AccountStatusEnum;

  @Column({
    type: 'enum',
    enum: RoleEnum,
    default: RoleEnum.USER,
  })
  userType: RoleEnum;

  @Column({ nullable: true })
  profilePicture: string;

  @BeforeInsert()
  @BeforeUpdate()
  lowercase() {
    this.fullName = this?.fullName.toLowerCase();
    this.username = this?.email.toLowerCase();
  }

  @Column({ default: false })
  isAdmin: boolean;

  @Column({ type: String, nullable: true })
  mfa_secret: string;

  @Column({ type: Boolean, default: false })
  is_mfa_enabled: boolean;

  @Column({ type: Boolean, default: false })
  is_mfa_started: boolean;

  @Column({ type: String, nullable: true })
  recovery_code?: string;

  toJSON() {
    delete this.password;
    // delete this.createdAt;
    // delete this.updatedAt;
    // this.name = `${this.firstName[0].toUpperCase() + this.firstName.slice(1)} ${(this.lastName)[0].toUpperCase()}.`;
    return this;
  }
}
