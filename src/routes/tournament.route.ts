import { Router } from 'express';
import TournamentController from '../controllers/tournament.controller';

const router: Router = Router();

router.get('/', async (req, res) => await TournamentController.getTournaments(req, res)); // Get all tournaments
router.get('/:id', async (req, res) => await TournamentController.getTournamentById(req, res)); // Get tournament by id
router.post('/', async (req, res) => await TournamentController.createTournament(req, res)); // Create a new tournament
router.put('/:id', async (req, res) => await TournamentController.updateTournament(req, res)); // Update tournament
router.delete('/:id', async (req, res) => await TournamentController.deleteTournament(req, res)); // Delete tournament

export default router;
