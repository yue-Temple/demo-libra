import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from "typeorm";
import { User } from "./User";

@Entity()
export class UserPasswordReset {
  @PrimaryGeneratedColumn()
  id!: number; // 主キー

  @Column({ type: 'varchar', length: 100, unique: true })
  token: string; // パスワードリセット用トークン

  @Column({ type: 'timestamp' })
  expires_at: Date; // トークンの有効期限

  @Column({ type: 'varchar', length: 12 })
  user_id: string; // ユーザーID（外部キー）

  @ManyToOne(() => User, (user) => user.passwordResetTokens, {
    onDelete: 'CASCADE', // ユーザーが削除された場合、関連するトークンも削除
  })
  @JoinColumn({ name: 'user_id' }) // 外部キー制約を設定
  user!: User; // ユーザーとのリレーション

  constructor(
    token: string = '',
    expires_at: Date = new Date(),
    user_id: string = ''
  ) {
    this.token = token;
    this.expires_at = expires_at;
    this.user_id = user_id;
  }
}