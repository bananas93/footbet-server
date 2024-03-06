import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { Predict } from './Predict';
import { Notification } from './Notification';
import { Achievement } from './Achievement';
import { Room } from './Room';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true, update: false })
  email: string;

  @Column({ nullable: true })
  phone?: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  googleId?: string;

  @Column({ nullable: true })
  password?: string;

  @Column({ nullable: true })
  verificationCode?: string;

  @Column({ default: 'en' })
  language: string;

  @OneToMany(() => Predict, (predict) => predict.user)
  predicts: Predict[];

  @OneToMany(() => Notification, (notification) => notification.user)
  notifications: Notification[];

  @OneToMany(() => Achievement, (achievement) => achievement.user)
  achievements: Achievement[];

  @ManyToMany(() => Room, (room) => room.participants, { cascade: ['remove'] })
  @JoinTable()
  rooms: Room[];

  @OneToMany(() => Room, (room) => room.creator)
  createdRooms: Room[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
