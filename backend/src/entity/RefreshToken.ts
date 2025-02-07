import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { User } from './User';

@Entity()
export class RefreshToken {
  @PrimaryGeneratedColumn('uuid')
  id!: string; // 非nullアサーションを使用

  @Column({ type: 'varchar', length: 255 })
  token: string;

  @Column({ type: 'timestamp' })
  expires_at: Date;

  @Column({ type: 'boolean', default: false })
  is_revoked: boolean = false;

  @Column({ type: 'varchar', length: 255, nullable: true })
  device_id: string | null; // デバイス識別子

  @ManyToOne(() => User, (user) => user.refreshTokens)
  user: User;

  constructor(token: string, expiresAt: Date, user: User, deviceId?: string) {
    this.token = token;
    this.expires_at = expiresAt;
    this.user = user;
    this.device_id = deviceId || null;
  }
}
