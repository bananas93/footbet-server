import { type Request, type Response, type NextFunction } from 'express';
import AuthService from '../services/auth.service';
import { getUserIdFromRefreshToken } from '../utils/userUtils';
import { type User } from 'src/entity/User';

class AuthController {
  async createUser(req: Request, res: Response): Promise<Response> {
    try {
      const data = req.body;
      const tokens = await AuthService.createUser(data);
      return res.status(201).json(tokens);
    } catch (err: any) {
      if (err.message === 'User already exists') {
        return res.status(409).json({ error: err.message });
      }
      return res.status(500).json({ error: err.message });
    }
  }

  async loginUser(req: Request, res: Response): Promise<Response> {
    try {
      const data = req.body;
      const tokens = await AuthService.loginUser(data);
      return res.status(200).json(tokens);
    } catch (err: any) {
      if (err.message === 'User not found' || err.message === 'Invalid password') {
        return res.status(401).json({ error: err.message });
      }
      return res.status(500).json({ error: err.message });
    }
  }

  async getUsers(req: Request, res: Response): Promise<Response> {
    try {
      const users = await AuthService.getUsers();
      return res.status(200).json(users);
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  }

  async getUser(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      const language = req.language; // 'de-CH'
      const languages = req.languages; // ['de-CH', 'de', 'en']
      console.log('language', language);
      console.log('languages', languages);
      const user = await AuthService.getUser(Number(id));
      return res.status(200).json(user);
    } catch (err: any) {
      if (err.message === 'User not found') {
        return res.status(404).json({ error: err.message });
      }
      return res.status(500).json({ error: err.message });
    }
  }

  async editUser(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      const data = req.body;
      const user = await AuthService.editUser(Number(id), data);
      return res.status(200).json(user);
    } catch (err: any) {
      if (err.message === 'User not found') {
        return res.status(404).json({ error: err.message });
      }
      return res.status(500).json({ error: err.message });
    }
  }

  async forgotPassword(req: Request, res: Response): Promise<Response> {
    try {
      const { email } = req.body;
      const message = await AuthService.forgotPassword(email);
      return res.status(200).json({ message });
    } catch (err: any) {
      if (err.message === 'User not found') {
        return res.status(404).json({ error: err.message });
      }
      return res.status(500).json({ error: err.message });
    }
  }

  async changePassword(req: Request, res: Response): Promise<Response> {
    try {
      const { email, code, password } = req.body;
      await AuthService.changePassword(email, code, password);
      return res.status(200).json({ message: 'Password changed' });
    } catch (err: any) {
      if (err.message === 'User not found' || err.message === 'Invalid token') {
        return res.status(404).json({ error: err.message });
      }
      return res.status(500).json({ error: err.message });
    }
  }

  async checkResetToken(req: Request, res: Response): Promise<Response> {
    try {
      const { code } = req.body;
      const message = await AuthService.checkResetToken(code);
      return res.status(200).json({ message });
    } catch (err: any) {
      if (err.message === 'Invalid token') {
        return res.status(404).json({ error: err.message });
      }
      if (err.message === 'Invalid token or token expired') {
        return res.status(400).json({ error: err.message });
      }
      return res.status(500).json({ error: err.message });
    }
  }

  async deleteUser(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      await AuthService.deleteUser(Number(id));
      return res.status(200).json({ message: 'User deleted' });
    } catch (err: any) {
      if (err.message === 'User not found') {
        return res.status(404).json({ error: err.message });
      }
      return res.status(500).json({ error: err.message });
    }
  }

  async authGoogleUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = req.user as User;
      const { accessToken, refreshToken } = await AuthService.authGoogleUser(user);
      res.redirect(`${process.env.CLIENT_URL}/signin?accessToken=${accessToken}&refreshToken=${refreshToken}`);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }

  async refreshAccessToken(req: Request, res: Response): Promise<Response> {
    const { refreshToken } = req.body;
    try {
      const userId = getUserIdFromRefreshToken(refreshToken);
      const { accessToken, newRefreshToken } = await AuthService.refreshAccessToken(refreshToken, Number(userId));
      return res.status(201).json({ accessToken, refreshToken: newRefreshToken });
    } catch (error) {
      return res.status(400).json({ error: 'Invalid refresh token.' });
    }
  }
}

export default new AuthController();
