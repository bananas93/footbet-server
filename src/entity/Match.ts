import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { Tournament } from './Tournament';
import { Team } from './Team';
import { Predict } from './Predict';

export enum MatchStage {
  GROUP_STAGE = 'Group Stage',
  ROUND_OF_16 = 'Round of 16',
  QUARTERFINALS = 'Quarterfinals',
  SEMIFINALS = 'Semifinals',
  FINAL = 'Final',
  THIRD_PLACE_PLAYOFF = 'Third Place Playoff',
}

export enum MatchResult {
  HOME_WIN = 'Home Win',
  AWAY_WIN = 'Away Win',
  DRAW = 'Draw',
}

export enum MatchStatus {
  SCHEDULED = 'Scheduled',
  IN_PROGRESS = 'In Progress',
  FINISHED = 'Finished',
  POSTPONED = 'Postponed',
}

export enum MatchGroupName {
  A = 'A',
  B = 'B',
  C = 'C',
  D = 'D',
  E = 'E',
  F = 'F',
  G = 'G',
  H = 'H',
}

@Entity()
export class Match {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'enum',
    enum: MatchStage,
    default: MatchStage.GROUP_STAGE,
  })
  stage: MatchStage;

  @Column({
    type: 'enum',
    enum: MatchStatus,
    default: MatchStatus.SCHEDULED,
  })
  status: MatchStatus;

  @Column({
    type: 'enum',
    enum: MatchResult,
    nullable: true,
  })
  result: MatchResult;

  @Column({
    type: 'enum',
    enum: MatchGroupName,
    nullable: true,
  })
  groupName: MatchGroupName;

  @Column({ default: 0 })
  homeScore?: number;

  @Column({ default: 0 })
  awayScore?: number;

  @Column()
  matchDate: Date;

  @ManyToOne(() => Tournament, (tournament) => tournament.matches)
  @JoinColumn({ name: 'tournamentId' })
  tournament: Tournament;

  @Column()
  tournamentId: number;

  @Column({ nullable: true })
  homeTeamId?: number;

  @Column({ nullable: true })
  awayTeamId?: number;

  @ManyToOne(() => Team, { nullable: true })
  @JoinColumn({ name: 'homeTeamId' })
  homeTeam: Team;

  @ManyToOne(() => Team, { nullable: true })
  @JoinColumn({ name: 'awayTeamId' })
  awayTeam: Team;

  @OneToMany(() => Predict, (predict) => predict.match)
  predicts: Predict[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
