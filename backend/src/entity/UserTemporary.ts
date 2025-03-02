import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity()
export class UserTemporary {
  @PrimaryGeneratedColumn()
  id!: number; // 明示的に undefined を許容

  @Column({ type: 'varchar', length: 255, unique: true })
  email: string; // 登録しようとしているメールアドレス

  @Column({ type: 'varchar', length: 6 }) // 認証コード（例: 6桁）
  verification_code: string;

  @CreateDateColumn({ type: 'timestamp' })
  created_at!: Date; // 明示的に undefined を許容

  @Column({ type: 'timestamp' })
  expires_at: Date; // 有効期限（例: 10分後）

  constructor(
    email: string = '',
    verification_code: string = '',
    expires_at: Date = new Date()
  ) {
    this.email = email;
    this.verification_code = verification_code;
    this.expires_at = expires_at;
  }
}
