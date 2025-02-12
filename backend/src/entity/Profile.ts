import { Entity, OneToOne, Column, JoinColumn, PrimaryColumn } from 'typeorm';
import { User } from './User';
import { InfoBlock } from '../../../sharetypes';

@Entity()
export class Profile {
  @PrimaryColumn({ type: 'integer' })
  user_number: number;

  @OneToOne(() => User, (user) => user.profile, {
    onDelete: 'CASCADE', // 外部キー制約を明示的に指定
  })
  @JoinColumn({ name: 'user_number', referencedColumnName: 'user_number' }) // User の user_number を参照
  user!: User;

  @Column({ type: 'jsonb', nullable: true }) // 'json' → 'jsonb' (PostgreSQL推奨)
  blocks: InfoBlock[] | null;

  constructor(user_number: number, blocks: InfoBlock[]) {
    this.user_number = user_number;
    this.blocks = blocks;
  }
}
