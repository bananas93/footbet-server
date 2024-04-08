import { Router } from 'express';
import TournamentController from '../controllers/tournament.controller';
import checkAuth from '../middlewares/auth.middleware';

const router: Router = Router();

router.get('/', checkAuth, async (req, res) => await TournamentController.getTournaments(req, res)); // Get all tournaments
router.get('/:id', checkAuth, async (req, res) => await TournamentController.getTournamentById(req, res)); // Get tournament by id
router.post('/', checkAuth, async (req, res) => await TournamentController.createTournament(req, res)); // Create a new tournament
router.put('/:id', checkAuth, async (req, res) => await TournamentController.updateTournament(req, res)); // Update tournament
router.delete('/', checkAuth, async (req, res) => await TournamentController.deleteTournament(req, res)); // Delete tournament

export default router;
