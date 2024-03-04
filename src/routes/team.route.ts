import { Router } from 'express';
import TeamController from '../controllers/team.controller';

const router: Router = Router();

router.get('/', async (req, res) => await TeamController.getAllTeams(req, res)); // Get all teams
router.get('/:id', async (req, res) => await TeamController.getTeamById(req, res)); // Get team by id
router.post('/', async (req, res) => await TeamController.createTeam(req, res)); // Create a new team
router.put('/:id', async (req, res) => await TeamController.updateTeam(req, res)); // Update team
router.delete('/:id', async (req, res) => await TeamController.deleteTeam(req, res)); // Delete team

export default router;
