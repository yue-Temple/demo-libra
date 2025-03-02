import {
  Entity,
  PrimaryColumn,
  Column,
  OneToOne,
  CreateDateColumn,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { Profile } from './Profile';
import { History } from './History';
import { Role } from '../backtype';
import { RefreshToken } from './RefreshToken';
import { Menu } from './Menu';
import { UserPasswordReset } from './UserPasswordReset';

@Entity()
export class User {
  @PrimaryColumn({ type: 'varchar', length: 12, unique: true })
  user_id: string;

  @Column({ type: 'integer', unique: true, generated: 'increment' })
  user_number: number;

  @Column({ type: 'varchar', length: 20, nullable: true })
  user_name: string | null;

  @Column({ type: 'varchar', length: 50, nullable: true })
  user_email: string | null;

  @Column({ type: 'varchar', length: 255 })
  user_icon: string;

  @Column({ type: 'varchar', length: 60, nullable: true })
  password: string | null;

  @Column({ type: 'varchar', length: 60, nullable: true })
  user_role: Role | null; // ユーザーロール

  @Column({ type: 'varchar', length: 255, nullable: true })
  google_user_id: string | null;

  @CreateDateColumn({ type: 'timestamp' }) // 'datetime' → 'timestamp'
  created_at: Date = new Date(); // アカウント作成日時

  @Column({ type: 'timestamp', nullable: true }) // TIMESTAMP に変更
  last_login: Date | null; // 最終ログイン日時

  @Column({ type: 'boolean', default: false })
  is_email_verified: boolean = false; // メール検証状態

  // リレーション
  @OneToOne(() => Profile, (profile) => profile.user, {
    onDelete: 'CASCADE',
  })
  profile!: Profile; // ユーザーは1つのプロフィールを持つ

  @OneToOne(() => History, (history) => history.user, {
    onDelete: 'CASCADE',
  })
  history!: History; // ユーザーは1つのヒストリーを持つ

  @JoinColumn({ name: 'user_number', referencedColumnName: 'user_number' }) // Menu の user_number を参照
  menu!: Menu; // ユーザーは1つのメニューを持つ

  @OneToMany(() => RefreshToken, (refreshToken) => refreshToken.user, {
    onDelete: 'CASCADE',
  })
  refreshTokens!: RefreshToken[]; // リフレッシュトークンとのリレーション

  @OneToMany(() => UserPasswordReset, (UserPasswordReset) => UserPasswordReset.user, {
    onDelete: 'CASCADE',
  })
  passwordResetTokens!: UserPasswordReset[]; // パスワードリセットトークンとのリレーション

  constructor(
    user_id: string = '',
    user_number: number = 0,
    user_name: string | null = '名無しのユーザー',
    user_email: string | null = null,
    user_icon: string = '',
    password: string | null = null,
    user_role: Role = Role.NormalUser,
    google_user_id: string | null = null,
    last_login: Date | null = null
  ) {
    this.user_id = user_id;
    this.user_number = user_number;
    this.user_name = user_name;
    this.user_email = user_email;
    this.user_icon = user_icon;
    this.password = password;
    this.user_role = user_role;
    this.google_user_id = google_user_id;
    this.last_login = last_login;
  }
}