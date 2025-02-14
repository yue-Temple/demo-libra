import { Entity, PrimaryColumn, Column, OneToOne, JoinColumn } from 'typeorm';
import { User } from './User';
import { Features } from '../../../sharetypes';

@Entity()
export class Menu {
  @PrimaryColumn({ type: 'integer' })
  user_number: number; // ユーザー番号を主キーとして設定

  @OneToOne(() => User, (user) => user.menu, {
    onDelete: 'CASCADE', // 外部キー制約を明示的に指定
  })
  @JoinColumn({ name: 'user_number', referencedColumnName: 'user_number' })
  user!: User;

  @Column({ type: 'jsonb' }) // 'json' → 'jsonb' (PostgreSQL推奨)
  feature_value: Features[];

  @Column({ type: 'varchar', length: 255 })
  layout: string;

  // メニュー発行時の初期値を設定
  constructor(
    user_number: number = 0,
    feature_value: Features[] = [
      { name: 'profile', value: 1, title: 'Profile' },
      { name: 'history', value: 2, title: 'History' },
      { name: 'chara', value: 0, title: 'Chara' },
      { name: 'data', value: 0, title: 'Gallery' },
      { name: 'relation', value: 0, title: 'Relation' },
    ],
    layout: string = 'layout1'
  ) {
    this.user_number = user_number;
    this.feature_value = feature_value;
    this.layout = layout;
  }
}
