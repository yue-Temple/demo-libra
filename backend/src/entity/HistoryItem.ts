import { Entity, PrimaryColumn, Column, ManyToOne, Index } from 'typeorm';
import { InfoBlock } from '../../../sharetypes';
import { History } from './History';

@Entity()
export class HistoryItem {
  @PrimaryColumn({ type: 'varchar', length: 17 }) // YYYYMMDDHHmmssSSS 形式の主キー
  historyid: string;

  @Column({ type: 'jsonb', nullable: true }) // 'json' → 'jsonb' (PostgreSQL推奨)
  date: string[] | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  keydate: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  title: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  system: string | null;

  @Column({ type: 'text', nullable: true })
  report: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  imgURL: string | null;

  @Column({ default: false })
  private: boolean;

  @Column({ type: 'jsonb', nullable: true }) // 'json' → 'jsonb' (PostgreSQL推奨)
  childblock: InfoBlock[] | [];

  @ManyToOne(() => History, (history) => history.histories, {
    onDelete: 'CASCADE', // 外部キー制約を明示的に指定
  })
  history!: History;

  constructor(
    historyid: string | null = null,
    date: string[] | null = null,
    keydate: string | null = null,
    title: string | null = null,
    system: string | null = null,
    report: string | null = null,
    imgURL: string | null = null,
    privateFlag: boolean = false,
    childblock: InfoBlock[] | [] = []
  ) {
    this.historyid = historyid || generateCustomId();
    this.date = date;
    this.keydate = keydate;
    this.title = title;
    this.system = system;
    this.report = report;
    this.imgURL = imgURL;
    this.private = privateFlag;
    this.childblock = childblock;
  }
}

// カスタムID生成関数
function generateCustomId(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');
  const milliseconds = String(now.getMilliseconds()).padStart(3, '0');
  return `${year}${month}${day}${hours}${minutes}${seconds}${milliseconds}`;
}
