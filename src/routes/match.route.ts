import { Router } from 'express';
import MatchController from '../controllers/match.controller';
import checkAuth from '../middlewares/auth.middleware';

const router: Router = Router();

router.get('/all/:tournamentId?', checkAuth, async (req, res) => await MatchController.getAllMatches(req, res)); // Get all matches
router.get('/:id', checkAuth, async (req, res) => await MatchController.getMatchById(req, res)); // Get match by id
router.post('/', checkAuth, async (req, res) => await MatchController.createMatch(req, res)); // Create a new match
router.put('/:id', checkAuth, async (req, res) => await MatchController.updateMatch(req, res)); // Update match
router.delete('/', checkAuth, async (req, res) => await MatchController.deleteMatch(req, res)); // Delete match

export default router;
