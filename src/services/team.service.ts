import AppDataSource from '../config/db';
import { Team, TeamType } from '../entity/Team';
import { In, type Repository } from 'typeorm';

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
        order: { name: 'ASC' },
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

  async createTeam(data: Record<string, any>, filename: string): Promise<Team> {
    try {
      const teamExists = await this.teamRepository.findOne({ where: { name: data.name } });
      if (teamExists) {
        throw new Error('Team already exists');
      }
      let newData = { ...data };
      if (filename) {
        newData = { ...data, logo: filename };
      }
      const team = this.teamRepository.create(newData);
      await this.teamRepository.save(team);
      return team;
    } catch (error: any) {
      throw new Error(error.message || 'An error occurred in the service layer');
    }
  }

  async updateTeam(id: number, data: Record<string, any>, filename: string): Promise<Team> {
    try {
      let newData = { ...data };
      if (filename) {
        newData = { ...data, logo: filename };
      }
      await this.teamRepository.update(id, newData);
      const team = await this.teamRepository.findOne({ where: { id } });
      if (!team) {
        throw new Error('Team not found');
      }
      return team;
    } catch (error: any) {
      throw new Error(error.message || 'An error occurred in the service layer');
    }
  }

  async deleteTeam(teamsIds: number[]): Promise<void> {
    try {
      const teams = await this.teamRepository.find({
        where: { id: In(teamsIds) },
      });
      if (!teams.length) {
        throw new Error('Teams not found');
      }
      const deleteResult = await this.teamRepository.delete({ id: In(teamsIds) });

      if (!deleteResult.affected) {
        throw new Error('Teams not found');
      }
    } catch (error: any) {
      throw new Error(error.message || 'An error occurred in the service layer');
    }
  }
}

export default new TeamService();
