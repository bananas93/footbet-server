import { AppDataSource } from '../config/db';
import { Match, MatchStage, type MatchStatus, type MatchGroupName } from '../entity/Match';
import { type Repository } from 'typeorm';

export interface MatchPayload {
  stage: MatchStage;
  status?: MatchStatus;
  groupName?: MatchGroupName;
  homeScore?: number;
  awayScore?: number;
  matchDate: Date;
  tournamentId: number;
  homeTeamId: number;
  awayTeamId: number;
}

export interface MatchResponse {
  id: number;
  stage: MatchStage;
  tour: string;
  date: string;
  games: Match[];
}

class MatchService {
  private readonly matchRepository: Repository<Match>;

  constructor() {
    this.matchRepository = AppDataSource.getRepository(Match);
  }

  async getAllMatches(): Promise<MatchResponse[]> {
    try {
      const matches = await this.matchRepository.find({
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
          },
          awayTeam: {
            id: true,
            name: true,
          },
        },
      });
      if (!matches) {
        return [];
      }

      const groupedMatches: Record<string, Match[]> = {};

      matches.forEach((match) => {
        const key = match.stage === MatchStage.GROUP_STAGE ? `${match.stage}_${match.groupTour}` : match.stage;

        if (!groupedMatches[key]) {
          groupedMatches[key] = [];
        }

        groupedMatches[key].push(match);
      });

      const groupArrays: MatchResponse[] = Object.keys(groupedMatches).map((key, index) => ({
        id: index + 1,
        stage: groupedMatches[key][0].stage,
        date: groupedMatches[key][0].matchDate.toISOString().split('T')[0],
        tour: groupedMatches[key][0].groupTour || null,
        games: groupedMatches[key],
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
      const match = this.matchRepository.create(data);
      await this.matchRepository.save(match);
      return match;
    } catch (error: any) {
      throw new Error(error.message || 'An error occurred in the service layer');
    }
  }

  async updateMatch(id: number, data: MatchPayload): Promise<Match> {
    try {
      await this.matchRepository.update(id, data);
      const match = await this.matchRepository.findOne({ where: { id } });
      if (!match) {
        throw new Error('Match not found');
      }
      return match;
    } catch (error: any) {
      throw new Error(error.message || 'An error occurred in the service layer');
    }
  }

  async deleteMatch(id: number): Promise<boolean> {
    try {
      const match = await this.matchRepository.findOne({ where: { id } });
      if (!match) {
        throw new Error('Match not found');
      }
      await this.matchRepository.delete(id);
      return true;
    } catch (error: any) {
      throw new Error(error.message || 'An error occurred in the service layer');
    }
  }
}

export default new MatchService();
