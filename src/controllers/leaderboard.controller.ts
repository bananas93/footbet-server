import { type Request, type Response } from 'express';
import LeaderboardService from '../services/leaderboard.service';

class LeaderboardController {
  async getLeaderboard(req: Request, res: Response): Promise<void> {
    try {
      const leaderboardData = await LeaderboardService.getLeaderboard();
      res.status(200).json(leaderboardData);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }
}

export default new LeaderboardController();
