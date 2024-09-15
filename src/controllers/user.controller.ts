import { type Request, type Response } from 'express';
import UserService from '../services/user.service';
import { getUserIdFromToken } from '../utils/userUtils';

class UserController {
  async getUserProfile(req: Request, res: Response): Promise<Response> {
    try {
      const userId = getUserIdFromToken(req.headers);
      const user = await UserService.getUserProfile(Number(userId));
      return res.status(200).json(user);
    } catch (err: any) {
      if (err.message === 'User not found') {
        return res.status(404).json({ error: err.message });
      }
      return res.status(500).json({ error: err.message });
    }
  }

  async getUserPublicProfile(req: Request, res: Response): Promise<Response> {
    try {
      const { userId, tournamentId } = req.params;
      const user = await UserService.getUserPublicProfile(Number(userId), Number(tournamentId));
      return res.status(200).json(user);
    } catch (err: any) {
      if (err.message === 'User not found') {
        return res.status(404).json({ error: err.message });
      }
      return res.status(500).json({ error: err.message });
    }
  }

  async editUserProfile(req: Request, res: Response): Promise<Response> {
    try {
      const userId = getUserIdFromToken(req.headers);
      const filename = req.file ? req.file.filename : null;
      const user = await UserService.editUserProfile(Number(userId), req.body, filename);
      return res.status(200).json(user);
    } catch (err: any) {
      if (err.message === 'User not found') {
        return res.status(404).json({ error: err.message });
      }
      return res.status(500).json({ error: err.message });
    }
  }

  async changePassword(req: Request, res: Response): Promise<Response> {
    try {
      const userId = getUserIdFromToken(req.headers);
      const user = await UserService.changePassword(Number(userId), req.body);
      return res.status(200).json(user);
    } catch (err: any) {
      if (err.message === 'User not found') {
        return res.status(404).json({ error: err.message });
      }
      return res.status(500).json({ error: err.message });
    }
  }
}

export default new UserController();
