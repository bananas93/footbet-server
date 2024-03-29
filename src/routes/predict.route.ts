import { Router } from 'express';
import PredictController from '../controllers/predict.controller';
import checkAuth from '../middlewares/auth.middleware';

const router: Router = Router();

router.get('/', checkAuth, async (req, res) => await PredictController.getAllPredicts(req, res)); // Get all predicts
router.get('/match/:matchId', checkAuth, async (req, res) => await PredictController.getPredictByMatchId(req, res)); // Get predict by match id
router.get('/user/:userId', checkAuth, async (req, res) => await PredictController.getPredictByUserId(req, res)); // Get predict by user id
router.post('/', checkAuth, async (req, res) => await PredictController.createOrUpdatePredict(req, res)); // Create or update predict
router.delete('/:id', checkAuth, async (req, res) => await PredictController.deletePredict(req, res)); // Delete predict

export default router;
