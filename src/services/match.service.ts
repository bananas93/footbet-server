import { In, type EntityManager, type Repository } from 'typeorm';
import { io } from '../socket';
import { Predict } from '../entity/Predict';
import AppDataSource from '../config/db';
import PointsCalculator from '../utils/calculate';
import { Match, MatchGroupTour, MatchStage, MatchStatus, type StageType } from '../entity/Match';
export interface MatchResponse {
  id: number;
  stage: string;
  data: Match[];
}

class MatchService {
  private readonly matchRepository: Repository<Match>;
  private readonly predictRepository: Repository<Predict>;

  constructor() {
    this.matchRepository = AppDataSource.getRepository(Match);
    this.predictRepository = AppDataSource.getRepository(Predict);
  }

  async getAllMatches(userId: number, tournamentId?: number, flat?: boolean): Promise<MatchResponse[] | Match[]> {
    try {
      const where = tournamentId ? { tournamentId } : {};
      const matches = await this.matchRepository
        .createQueryBuilder('match')
        .leftJoinAndSelect('match.homeTeam', 'homeTeam')
        .leftJoinAndSelect('match.awayTeam', 'awayTeam')
        .leftJoinAndSelect('match.tournament', 'tournament')
        .leftJoinAndMapOne('match.predict', 'match.predicts', 'predicts', 'predicts.userId = :userId', { userId })
        .where(where)
        .select([
          'match.id',
          'match.stage',
          'match.groupTour',
          'match.status',
          'match.result',
          'match.groupName',
          'match.homeScore',
          'match.awayScore',
          'match.matchDate',
          'match.tournamentLeague',
          'tournament.id',
          'tournament.name',
          'homeTeam.id',
          'homeTeam.name',
          'homeTeam.logo',
          'awayTeam.id',
          'awayTeam.name',
          'awayTeam.logo',
          'predicts.id',
          'predicts.userId',
          'predicts.homeScore',
          'predicts.awayScore',
          'predicts.points',
        ])
        .orderBy('match.matchDate', 'ASC')
        .getMany();

      if (!matches) {
        return [];
      }

      if (flat) {
        return matches;
      }

      const currentDate = new Date();
      const groupedMatches: Record<string, Match[]> = {};

      matches.forEach((match) => {
        if (match.matchDate < currentDate && match.status === MatchStatus.SCHEDULED) {
          match.status = MatchStatus.IN_PROGRESS;
          void this.updateMatch(match.id, { status: MatchStatus.IN_PROGRESS });
        }
        let stage: StageType = match.stage;
        if (stage === MatchStage.GROUP_STAGE) {
          stage = match.groupTour;
        }
        if (!groupedMatches[stage]) {
          groupedMatches[stage] = [];
        }
        groupedMatches[stage].push(match);
      });

      const groupArrays: MatchResponse[] = [];
      let id = 1;
      for (const stage in groupedMatches) {
        const stageObject: MatchResponse = {
          id: id++,
          stage: stage as MatchStage,
          data: groupedMatches[stage],
        };
        groupArrays.push(stageObject);
      }

      return groupArrays;
    } catch (error: any) {
      throw new Error(error.message || 'An error occurred in the service layer');
    }
  }

  async getMatchById(id: number): Promise<Match> {
    try {
      const match = await this.matchRepository.findOne({
        where: { id },
        relations: {
          homeTeam: true,
          awayTeam: true,
          tournament: true,
        },
        select: {
          id: true,
          stage: true,
          groupTour: true,
          status: true,
          result: true,
          groupName: true,
          homeScore: true,
          awayScore: true,
          matchDate: true,
          tournament: {
            id: true,
            name: true,
          },
          homeTeam: {
            id: true,
            name: true,
          },
          awayTeam: {
            id: true,
            name: true,
          },
        },
      });
      if (!match) {
        throw new Error('Match not found');
      }
      return match;
    } catch (error: any) {
      throw new Error(error.message || 'An error occurred in the service layer');
    }
  }

  async createMatch(data: Partial<Match>): Promise<Match> {
    try {
      const { homeTeamId, awayTeamId } = data;
      if (homeTeamId === awayTeamId) {
        throw new Error('Home team and away team cannot be the same');
      }
      const matchTour = MatchGroupTour[data.groupTour as unknown as keyof typeof MatchGroupTour];
      data = {
        ...data,
        groupTour: matchTour,
      };
      const match = this.matchRepository.create(data);
      await this.matchRepository.save(match);
      return match;
    } catch (error: any) {
      throw new Error(error.message || 'An error occurred in the service layer');
    }
  }

  async updateMatch(id: number, data: Partial<Match>): Promise<Match> {
    const entityManager: EntityManager = this.matchRepository.manager;

    try {
      await entityManager.transaction(async (transactionalEntityManager: EntityManager) => {
        const matchTour = MatchGroupTour[data.groupTour as unknown as keyof typeof MatchGroupTour];
        data = {
          ...data,
          groupTour: matchTour,
        };
        // Update the match
        await transactionalEntityManager.update(Match, id, data);

        // Fetch the updated match
        const updatedMatch = await transactionalEntityManager.findOne(Match, {
          where: { id },
          relations: {
            homeTeam: true,
            awayTeam: true,
          },
          select: {
            id: true,
            homeScore: true,
            awayScore: true,
            homeTeam: {
              name: true,
            },
            awayTeam: {
              name: true,
            },
          },
        });

        if (!updatedMatch) {
          throw new Error('Match not found');
        }

        // Calculate points and update predictions if the match is in progress or finished
        if ([MatchStatus.IN_PROGRESS, MatchStatus.FINISHED].includes(updatedMatch.status)) {
          const predictions = await this.predictRepository.find({ where: { matchId: id } });

          // Calculate points for each prediction and update the points in
          for (const prediction of predictions) {
            const result = PointsCalculator.calculatePointsForPrediction(updatedMatch, prediction);

            if (typeof result === 'number') {
              // Handle the case where result is 0 (or any other numeric value) if needed
              console.log('Points earned:', result);
            } else {
              const { totalPoints, exactScorePoints, matchResultPoints, goalsDifferencePoints, fivePlusGoalsPoints } =
                result;

              // Update the points in the Predict entity
              await transactionalEntityManager.update(Predict, prediction.id, {
                points: +totalPoints,
                correctScore: +exactScorePoints,
                correctDifference: +goalsDifferencePoints,
                fivePlusGoals: +fivePlusGoalsPoints,
                correctResult: +matchResultPoints,
              });
            }
          }
        } else {
          const predictions = await this.predictRepository.find({ where: { matchId: id } });
          for (const prediction of predictions) {
            await transactionalEntityManager.delete(Predict, prediction.id);
          }
        }

        io.emit('matchUpdated', updatedMatch);
      });

      // Fetch the final updated match
      const finalUpdatedMatch = await entityManager.findOne(Match, { where: { id } });
      if (!finalUpdatedMatch) {
        throw new Error('Match not found');
      }

      return finalUpdatedMatch;
    } catch (error: any) {
      throw new Error(error.message || 'An error occurred in the service layer');
    }
  }

  async deleteMatch(matchesIds: number[]): Promise<void> {
    try {
      const matches = await this.matchRepository.find({
        where: { id: In(matchesIds) },
      });

      if (!matches.length) {
        throw new Error('Matches not found');
      }
      const deleteResult = await this.matchRepository.delete({ id: In(matchesIds) });
      if (!deleteResult.affected) {
        throw new Error('Matches not found');
      }
    } catch (error: any) {
      throw new Error(error.message || 'An error occurred in the service layer');
    }
  }
}

export default new MatchService();
