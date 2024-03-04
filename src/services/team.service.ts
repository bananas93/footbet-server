import { AppDataSource } from '../config/db';
import { Team, TeamType } from '../entity/Team';
import { type Repository } from 'typeorm';

class TeamService {
  private readonly teamRepository: Repository<Team>;

  constructor() {
    this.teamRepository = AppDataSource.getRepository(Team);
  }

  async getAllTeams(type: string): Promise<Team[]> {
    try {
      let whereClause: Record<string, any> = {};

      if (type === 'national') {
        whereClause = { type: TeamType.NATIONAL };
      } else if (type === 'club') {
        whereClause = { type: TeamType.CLUB };
      }

      const teams = await this.teamRepository.find({
        where: whereClause,
      });

      return teams;
    } catch (error: any) {
      throw new Error(error.message || 'An error occurred in the service layer');
    }
  }

  async getTeamById(id: number): Promise<Team> {
    try {
      const team = await this.teamRepository.findOne({ where: { id } });
      if (!team) {
        throw new Error('Team not found');
      }
      return team;
    } catch (error: any) {
      throw new Error(error.message || 'An error occurred in the service layer');
    }
  }

  async createTeam(data: Record<string, any>): Promise<Team> {
    try {
      const team = this.teamRepository.create(data);
      await this.teamRepository.save(team);
      return team;
    } catch (error: any) {
      throw new Error(error.message || 'An error occurred in the service layer');
    }
  }

  async updateTeam(id: number, data: Record<string, any>): Promise<Team> {
    try {
      await this.teamRepository.update(id, data);
      const team = await this.teamRepository.findOne({ where: { id } });
      if (!team) {
        throw new Error('Team not found');
      }
      return team;
    } catch (error: any) {
      throw new Error(error.message || 'An error occurred in the service layer');
    }
  }

  async deleteTeam(id: number): Promise<Team> {
    try {
      const team = await this.teamRepository.findOne({ where: { id } });
      if (!team) {
        throw new Error('Team not found');
      }
      await this.teamRepository.delete(id);
      return team;
    } catch (error: any) {
      throw new Error(error.message || 'An error occurred in the service layer');
    }
  }
}

export default new TeamService();
