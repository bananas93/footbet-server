import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Match } from './Match';
import { User } from './User';

@Entity()
export class Predict {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  matchId: number;

  @Column()
  userId: number;

  @Column()
  homeScore: number;

  @Column()
  awayScore: number;

  @Column({ nullable: true })
  points: number;

  // Additional detailed results
  @Column({ nullable: true })
  correctScore: boolean;

  @Column({ nullable: true })
  correctDifference: boolean;

  @Column({ nullable: true })
  fivePlusGoals: boolean;

  @Column({ nullable: true })
  correctResult: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Many-to-One relationship with Match
  @ManyToOne(() => Match, (match) => match.predicts)
  @JoinColumn({ name: 'matchId' })
  match: Match;

  // Many-to-One relationship with User
  @ManyToOne(() => User, (user) => user.predicts)
  @JoinColumn({ name: 'userId' })
  user: User;
}
