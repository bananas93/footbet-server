import { type Request, type Response } from 'express';
import TournamentService from '../services/tournament.service';
import { type TournamentType } from '../entity/Tournament';

class TournamentController {
  async getTournaments(req: Request, res: Response): Promise<Response> {
    try {
      const { type } = req.query;
      const tournaments = await TournamentService.getAllTournaments(type as TournamentType);
      return res.status(200).json(tournaments);
    } catch (error: any) {
      return res.status(500).json({ error: error.message || 'An error occurred in the controller layer' });
    }
  }

  async getTournamentById(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      const tournament = await TournamentService.getTournamentById(Number(id));
      return res.status(200).json(tournament);
    } catch (error: any) {
      return res.status(500).json({ error: error.message || 'An error occurred in the controller layer' });
    }
  }

  async createTournament(req: Request, res: Response): Promise<Response> {
    try {
      const filename = req.file ? req.file.filename : null;
      const tournament = await TournamentService.createTournament(req.body, filename);
      return res.status(201).json({ tournament, message: 'Tournament successfully created' });
    } catch (error: any) {
      return res.status(500).json({ error: error.message || 'An error occurred in the controller layer' });
    }
  }

  async updateTournament(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      const filename = req.file ? req.file.filename : null;
      const tournament = await TournamentService.updateTournament(Number(id), req.body, filename);
      return res.status(200).json({ tournament, message: 'Tournament successfully updated' });
    } catch (error: any) {
      return res.status(500).json({ error: error.message || 'An error occurred in the controller layer' });
    }
  }

  async getTournamentStandings(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      const standings = await TournamentService.getTournamentStandings(Number(id));
      return res.status(200).json(standings);
    } catch (error: any) {
      return res.status(500).json({ error: error.message || 'An error occurred in the controller layer' });
    }
  }

  async deleteTournament(req: Request, res: Response): Promise<Response> {
    try {
      const { tournamentsIds } = req.body;
      await TournamentService.deleteTournament(tournamentsIds);
      return res.status(200).json({ message: 'Tournament successfully deleted' });
    } catch (error: any) {
      return res.status(500).json({ error: error.message || 'An error occurred in the controller layer' });
    }
  }
}

export default new TournamentController();
