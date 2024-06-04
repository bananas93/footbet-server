import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { Match } from './Match';

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

  @Column({ default: 0 })
  groupNumber: number;

  @Column({ default: 0 })
  groupMatchNumber: number;

  @Column({ nullable: true })
  knockoutRound: number;

  @Column({ default: false })
  thirdPlaceMatch: boolean;

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

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
