import { Router } from 'express';
import TeamController from '../controllers/team.controller';
import checkAuth from '../middlewares/auth.middleware';

const router: Router = Router();

router.get('/', checkAuth, async (req, res) => await TeamController.getAllTeams(req, res)); // Get all teams
router.get('/:id', checkAuth, async (req, res) => await TeamController.getTeamById(req, res)); // Get team by id
router.post('/', checkAuth, async (req, res) => await TeamController.createTeam(req, res)); // Create a new team
router.put('/:id', checkAuth, async (req, res) => await TeamController.updateTeam(req, res)); // Update team
router.delete('/', checkAuth, async (req, res) => await TeamController.deleteTeam(req, res)); // Delete team

export default router;
