import { In, type EntityManager, type Repository } from 'typeorm';
import { Predict } from '../entity/Predict';
import { AppDataSource } from '../config/db';
import PointsCalculator from '../utils/calculate';
import { Match, MatchGroupTour, type MatchStage, MatchStatus, type MatchGroupName } from '../entity/Match';

export interface MatchPayload {
  stage: MatchStage;
  status?: MatchStatus;
  groupName?: MatchGroupName;
  groupTour?: MatchGroupTour;
  homeScore?: number;
  awayScore?: number;
  matchDate: Date;
  tournamentId: number;
  homeTeamId: number;
  awayTeamId: number;
}

export interface MatchResponse {
  id: number;
  groupName: MatchStage;
  matches: Match[];
}

class MatchService {
  private readonly matchRepository: Repository<Match>;
  private readonly predictRepository: Repository<Predict>;

  constructor() {
    this.matchRepository = AppDataSource.getRepository(Match);
    this.predictRepository = AppDataSource.getRepository(Predict);
  }

  async getAllMatches(tournamentId?: number, flat?: boolean): Promise<MatchResponse[] | Match[]> {
    try {
      const where = tournamentId ? { tournamentId } : {};
      const matches = await this.matchRepository.find({
        where,
        relations: {
          homeTeam: true,
          awayTeam: true,
          tournament: true,
          predicts: true,
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
            logo: true,
          },
          awayTeam: {
            id: true,
            name: true,
            logo: true,
          },
        },
      });
      if (!matches) {
        return [];
      }

      if (flat) {
        return matches;
      }

      // Group matches by groupName
      const groupedMatches: Record<string, Match[]> = {};
      matches.forEach((match) => {
        const groupName = match.groupName || 'Other';
        if (!groupedMatches[groupName]) {
          groupedMatches[groupName] = [];
        }
        groupedMatches[groupName].push(match);
      });

      // Sort matches within each group by matchDate
      for (const groupName in groupedMatches) {
        groupedMatches[groupName].sort((a, b) => a.matchDate.getTime() - b.matchDate.getTime());
      }

      // Transform groupedMatches into MatchResponse format
      const groupArrays: MatchResponse[] = Object.keys(groupedMatches).map((key, index) => ({
        id: index + 1,
        groupName: key as MatchStage,
        matches: groupedMatches[key],
      }));

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

  async createMatch(data: MatchPayload): Promise<Match> {
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

  async updateMatch(id: number, data: MatchPayload): Promise<Match> {
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
        const updatedMatch = await transactionalEntityManager.findOne(Match, { where: { id } });

        if (!updatedMatch) {
          throw new Error('Match not found');
        }

        // Calculate points and update predictions if the match is in progress or finished
        if ([MatchStatus.IN_PROGRESS, MatchStatus.FINISHED].includes(updatedMatch.status)) {
          const predictions = await this.predictRepository.find({ where: { matchId: id } });

          // Calculate points for each prediction and update the points in
          console.log('prediction', predictions);
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
        }
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
