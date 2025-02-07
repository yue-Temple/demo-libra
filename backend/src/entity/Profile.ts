import { Entity, OneToOne, Column, JoinColumn, PrimaryColumn } from 'typeorm';
import { User } from './User';
import { InfoBlock } from '../../../sharetypes';

@Entity()
export class Profile {
  @PrimaryColumn({ type: 'int' }) // user_numberを主キーとして設定
  user_number: number;

  @OneToOne(() => User, (user) => user.profile)
  @JoinColumn({ name: 'user_number', referencedColumnName: 'user_number' }) // User の user_number を参照
  user!: User;

  @Column({ type: 'json', nullable: true })
  blocks: InfoBlock[];

  constructor(user_number: number, blocks: InfoBlock[]) {
    this.user_number = user_number;
    this.blocks = blocks;
  }
}
