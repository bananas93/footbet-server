import { Router } from 'express';
import MatchController from '../controllers/match.controller';

const router: Router = Router();

router.get('/', async (req, res) => await MatchController.getAllMatches(req, res)); // Get all matches
router.get('/:id', async (req, res) => await MatchController.getMatchById(req, res)); // Get match by id
router.post('/', async (req, res) => await MatchController.createMatch(req, res)); // Create a new match
router.put('/:id', async (req, res) => await MatchController.updateMatch(req, res)); // Update match
router.delete('/:id', async (req, res) => await MatchController.deleteMatch(req, res)); // Delete match

export default router;
