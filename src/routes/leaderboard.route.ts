import { Router } from 'express';
import LeaderboardController from '../controllers/leaderboard.controller';
import checkAuth from '../middlewares/auth.middleware';

const router: Router = Router();

router.get('/', checkAuth, async (req, res) => {
  await LeaderboardController.getLeaderboard(req, res);
});

export default router;
