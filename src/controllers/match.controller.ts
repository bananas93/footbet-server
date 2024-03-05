import { type Request, type Response } from 'express';
import MatchService from '../services/match.service';

class MatchController {
  async getAllMatches(req: Request, res: Response): Promise<Response> {
    try {
      const matches = await MatchService.getAllMatches();
      return res.status(200).json(matches);
    } catch (error: any) {
      return res.status(500).json({ error: error.message || 'An error occurred in the controller layer' });
    }
  }

  async getMatchById(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      const match = await MatchService.getMatchById(Number(id));
      return res.status(200).json(match);
    } catch (error: any) {
      return res.status(500).json({ error: error.message || 'An error occurred in the controller layer' });
    }
  }

  async createMatch(req: Request, res: Response): Promise<Response> {
    try {
      const match = await MatchService.createMatch(req.body);
      return res.status(201).json({ match, message: 'Match successfully created' });
    } catch (error: any) {
      if (error.message.includes('ER_NO_REFERENCED_ROW_2')) {
        return res.status(400).json({ error: 'Invalid tournamentId, homeTeamId or awayTeamId' });
      }
      if (error.message.includes('matchDate')) {
        return res.status(400).json({ error: 'Match date is required' });
      }
      return res.status(500).json({ error: error.message || 'An error occurred in the controller layer' });
    }
  }

  async updateMatch(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      const match = await MatchService.updateMatch(Number(id), req.body);
      return res.status(200).json({ match, message: 'Match successfully updated' });
    } catch (error: any) {
      return res.status(500).json({ error: error.message || 'An error occurred in the controller layer' });
    }
  }

  async deleteMatch(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      await MatchService.deleteMatch(Number(id));
      return res.status(200).json({ message: 'Match successfully deleted' });
    } catch (error: any) {
      return res.status(500).json({ error: error.message || 'An error occurred in the controller layer' });
    }
  }
}

export default new MatchController();
