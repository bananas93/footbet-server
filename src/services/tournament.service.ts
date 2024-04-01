import { type Repository } from 'typeorm';
import { AppDataSource } from '../config/db';
import { Tournament, type TournamentType } from '../entity/Tournament';

class TournamentService {
  private readonly tournamentRepository: Repository<Tournament>;

  constructor() {
    this.tournamentRepository = AppDataSource.getRepository(Tournament);
  }

  async getAllTournaments(type?: TournamentType): Promise<Tournament[]> {
    console.log('type', type);
    try {
      const tournaments = await this.tournamentRepository.find({ where: { type } });
      if (!tournaments) {
        return [];
      }
      return tournaments;
    } catch (error: any) {
      throw new Error(error.message || 'An error occurred in the service layer');
    }
  }

  async getTournamentById(id: number): Promise<Tournament> {
    try {
      const tournament = await this.tournamentRepository.findOne({ where: { id } });
      if (!tournament) {
        throw new Error('Tournament not found');
      }
      return tournament;
    } catch (error: any) {
      throw new Error(error.message || 'An error occurred in the service layer');
    }
  }

  async createTournament(data: Record<string, any>): Promise<Tournament> {
    try {
      const tournament = this.tournamentRepository.create(data);
      await this.tournamentRepository.save(tournament);
      return tournament;
    } catch (error: any) {
      throw new Error(error.message || 'An error occurred in the service layer');
    }
  }

  async updateTournament(id: number, data: Record<string, any>): Promise<Tournament> {
    try {
      await this.tournamentRepository.update(id, data);
      const tournament = await this.tournamentRepository.findOne({ where: { id } });
      if (!tournament) {
        throw new Error('Tournament not found');
      }
      return tournament;
    } catch (error: any) {
      throw new Error(error.message || 'An error occurred in the service layer');
    }
  }

  async deleteTournament(id: number): Promise<Tournament> {
    try {
      const tournament = await this.tournamentRepository.findOne({ where: { id } });
      if (!tournament) {
        throw new Error('Tournament not found');
      }
      await this.tournamentRepository.delete(id);
      return tournament;
    } catch (error: any) {
      throw new Error(error.message || 'An error occurred in the service layer');
    }
  }
}

export default new TournamentService();
