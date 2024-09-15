import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { Match } from './Match';
import { Predict } from './Predict';

export enum TournamentStatus {
  SCHEDULED = 'scheduled',
  IN_PROGRESS = 'live',
  COMPLETED = 'completed',
}

export enum TournamentType {
  CLUB = 'club',
  NATIONAL = 'national',
}

@Entity()
export class Tournament {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  name: string;

  @Column({ default: 1 })
  leagues: number;

  @Column({ default: 0 })
  groupNumber: number;

  @Column({ default: 0 })
  groupMatchNumber: number;

  @Column({ nullable: true })
  knockoutRound: number;

  @Column({
    nullable: false,
    default: 2,
    transformer: {
      to(value: number): number {
        return value;
      },
      from(value: string): number {
        return parseInt(value, 10);
      },
    },
  })
  directNextRound: number;

  @Column({
    nullable: false,
    default: 1,
    transformer: {
      to(value: number): number {
        return value;
      },
      from(value: string): number {
        return parseInt(value, 10);
      },
    },
  })
  playoffRound: number;

  @Column({ default: false })
  thirdPlaceMatch: boolean;

  @Column({ default: true })
  hasTable: boolean;

  @Column({
    type: 'enum',
    enum: TournamentType,
    default: TournamentType.CLUB,
  })
  type: TournamentType;

  @Column({
    type: 'enum',
    enum: TournamentStatus,
    default: TournamentStatus.SCHEDULED,
  })
  status: TournamentStatus;

  @Column({ nullable: true })
  logo?: string;

  @OneToMany(() => Match, (match) => match.tournament)
  matches: Match[];

  @OneToMany(() => Predict, (predict) => predict.tournamentId)
  predicts: Predict[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
