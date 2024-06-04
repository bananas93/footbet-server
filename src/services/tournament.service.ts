import { In, type Repository } from 'typeorm';
import { AppDataSource } from '../config/db';
import { Tournament, type TournamentType } from '../entity/Tournament';
import League from '../utils/standings';

class TournamentService {
  private readonly tournamentRepository: Repository<Tournament>;

  constructor() {
    this.tournamentRepository = AppDataSource.getRepository(Tournament);
  }

  async getAllTournaments(type?: TournamentType): Promise<Tournament[]> {
    try {
      const tournaments = await this.tournamentRepository.find();
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

  async createTournament(data: Record<string, any>, filename: string): Promise<Tournament> {
    try {
      let newData = { ...data };
      if (filename) {
        newData = { ...data, logo: filename };
      }
      const tournament = this.tournamentRepository.create(newData);
      await this.tournamentRepository.save(tournament);
      return tournament;
    } catch (error: any) {
      throw new Error(error.message || 'An error occurred in the service layer');
    }
  }

  async updateTournament(id: number, data: Record<string, any>, filename: string): Promise<Tournament> {
    try {
      let newData = { ...data };
      if (filename) {
        newData = { ...data, logo: filename };
      }
      await this.tournamentRepository.update(id, newData);
      const tournament = await this.tournamentRepository.findOne({ where: { id } });
      if (!tournament) {
        throw new Error('Tournament not found');
      }
      return tournament;
    } catch (error: any) {
      throw new Error(error.message || 'An error occurred in the service layer');
    }
  }

  async getTournamentStandings(id: number): Promise<Record<string, any>> {
    try {
      const tournament = await this.tournamentRepository.findOne({
        where: { id },
        relations: ['matches', 'matches.homeTeam', 'matches.awayTeam'],
      });
      if (!tournament) {
        throw new Error('Tournament not found');
      }
      const league = new League(tournament.matches);
      const standings = league.getStandings();
      return standings;
    } catch (error: any) {
      throw new Error(error.message || 'An error occurred in the service layer');
    }
  }

  async deleteTournament(tournamentsIds: number[]): Promise<void> {
    try {
      const tournaments = await this.tournamentRepository.find({
        where: { id: In(tournamentsIds) },
      });
      if (!tournaments.length) {
        throw new Error('Tournaments not found');
      }
      const deleteResult = await this.tournamentRepository.delete({ id: In(tournamentsIds) });

      if (!deleteResult.affected) {
        throw new Error('Tournaments not found');
      }
    } catch (error: any) {
      throw new Error(error.message || 'An error occurred in the service layer');
    }
  }
}

export default new TournamentService();
