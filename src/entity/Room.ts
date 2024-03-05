import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToMany,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from './User';

export enum RoomType {
  PUBLIC = 'public',
  PRIVATE = 'private',
}

@Entity()
export class Room {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({
    type: 'enum',
    enum: RoomType,
    default: RoomType.PUBLIC,
  })
  type: RoomType;

  @Column({ nullable: true })
  password: string;

  @Column({ nullable: true, update: false })
  inviteUrl: string;

  @ManyToMany(() => User, (user) => user.rooms)
  participants: User[];

  @ManyToOne(() => User, (user) => user.createdRooms)
  @JoinColumn({ name: 'createdByUserId' })
  creator: User;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
