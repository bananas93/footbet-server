import { AppDataSource } from '../config/db';
import { Match, type MatchStage, type MatchStatus, type MatchGroupName } from '../entity/Match';
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

class MatchService {
  private readonly matchRepository: Repository<Match>;

  constructor() {
    this.matchRepository = AppDataSource.getRepository(Match);
  }

  async getAllMatches(): Promise<Match[]> {
    try {
      const matches = await this.matchRepository.find({
        relations: {
          homeTeam: true,
          awayTeam: true,
          tournament: true,
        },
        select: {
          id: true,
          stage: true,
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
      return matches;
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
