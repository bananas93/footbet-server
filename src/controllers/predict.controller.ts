import { type Request, type Response } from 'express';
import PredictService from '../services/predict.service';
import { getUserIdFromToken } from '../utils/userUtils';

class PredictController {
  async getAllPredicts(req: Request, res: Response): Promise<Response> {
    try {
      const predicts = await PredictService.getAllPredicts();
      return res.status(200).json(predicts);
    } catch (error: any) {
      return res.status(500).json({ error: error.message || 'An error occurred in the controller layer' });
    }
  }

  async getPredictByMatchId(req: Request, res: Response): Promise<Response> {
    try {
      const { matchId } = req.params;
      const predicts = await PredictService.getPredictByMatchId(Number(matchId));
      return res.status(200).json(predicts);
    } catch (error: any) {
      return res.status(500).json({ error: error.message || 'An error occurred in the controller layer' });
    }
  }

  async getPredictByUserId(req: Request, res: Response): Promise<Response> {
    try {
      const { userId } = req.params;
      const predicts = await PredictService.getPredictByUserId(Number(userId));
      return res.status(200).json(predicts);
    } catch (error: any) {
      return res.status(500).json({ error: error.message || 'An error occurred in the controller layer' });
    }
  }

  async createOrUpdatePredict(req: Request, res: Response): Promise<Response> {
    try {
      const userId = getUserIdFromToken(req.headers);
      const predict = await PredictService.createOrUpdatePredict(req.body, Number(userId));
      return res.status(201).json({ predict, message: 'Predict successfully saved' });
    } catch (error: any) {
      return res.status(500).json({ error: error.message || 'An error occurred in the controller layer' });
    }
  }

  async deletePredict(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      await PredictService.deletePredict(Number(id));
      return res.status(200).json({ message: 'Predict successfully deleted' });
    } catch (error: any) {
      return res.status(500).json({ error: error.message || 'An error occurred in the controller layer' });
    }
  }
}

export default new PredictController();
