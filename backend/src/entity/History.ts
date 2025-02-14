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
  @PrimaryColumn({ type: 'integer' })
  user_number: number;

  @OneToOne(() => User, (user) => user.history, {
    onDelete: 'CASCADE', // 外部キー制約を明示的に指定
  })
  @JoinColumn({ name: 'user_number', referencedColumnName: 'user_number' }) // User の user_number を参照
  user!: User;

  @OneToMany(() => HistoryItem, (historyItem) => historyItem.history, {
    cascade: true,
    onDelete: 'CASCADE', // 親レコード削除時に子レコードも削除
  }) // HistoryItem との One-to-Many リレーション
  histories!: HistoryItem[];

  constructor(user_number: number) {
    this.user_number = user_number;
  }
}
