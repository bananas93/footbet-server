import { type Request, type Response } from 'express';
import TournamentService from '../services/tournament.service';

class TournamentController {
  async getTournaments(req: Request, res: Response): Promise<Response> {
    try {
      const tournaments = await TournamentService.getAllTournaments();
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
      const tournament = await TournamentService.createTournament(req.body);
      return res.status(201).json({ tournament, message: 'Tournament successfully created' });
    } catch (error: any) {
      return res.status(500).json({ error: error.message || 'An error occurred in the controller layer' });
    }
  }

  async updateTournament(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      const tournament = await TournamentService.updateTournament(Number(id), req.body);
      return res.status(200).json({ tournament, message: 'Tournament successfully updated' });
    } catch (error: any) {
      return res.status(500).json({ error: error.message || 'An error occurred in the controller layer' });
    }
  }

  async deleteTournament(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      await TournamentService.deleteTournament(Number(id));
      return res.status(200).json({ message: 'Tournament successfully deleted' });
    } catch (error: any) {
      return res.status(500).json({ error: error.message || 'An error occurred in the controller layer' });
    }
  }
}

export default new TournamentController();
