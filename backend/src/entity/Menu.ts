import { Entity, PrimaryColumn, Column, OneToOne, JoinColumn } from 'typeorm';
import { User } from './User';
import { Features } from '../../../sharetypes';

@Entity()
export class Menu {
  @PrimaryColumn({ type: 'int' })
  user_number: number; // ユーザー番号を主キーとして設定

  @OneToOne(() => User)
  @JoinColumn({ name: 'user_number', referencedColumnName: 'user_number' })
  user?: User; // ユーザー情報を参照（optional）

  @Column({ type: 'json' })
  feature_value: Features[]; // Featureオブジェクト配列として設定

  @Column({ type: 'varchar', length: 255 })
  layout: string;

  // メニュー発行時の初期値を設定
  constructor(
    user_number: number = 0,
    feature_value: { name: string; value: number; title: string }[] = [
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
