import {
  Entity,
  PrimaryColumn,
  OneToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { User } from './User'; // User エンティティをインポート
import { HistoryItem } from './HistoryItem';

// History エンティティ
@Entity()
export class History {
  @PrimaryColumn({ type: 'int' }) // user_number を主キーとして設定
  user_number: number;

  @OneToOne(() => User, (user) => user.history) // User エンティティとの One-to-One リレーション
  @JoinColumn({ name: 'user_number', referencedColumnName: 'user_number' }) // User の user_number を参照
  user!: User;

  @OneToMany(() => HistoryItem, (historyItem) => historyItem.history, {
    cascade: true,
  }) // HistoryItem との One-to-Many リレーション
  histories!: HistoryItem[];

  constructor(user_number: number) {
    this.user_number = user_number;
  }
}
