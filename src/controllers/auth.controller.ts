import { type Request, type Response, type NextFunction } from 'express';
import passport from 'passport';
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

  async getUser(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
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
      const { token, password } = req.body;
      await AuthService.changePassword(token, password);
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
      const { token } = req.body;
      const message = await AuthService.checkResetToken(token);
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
    passport.authenticate('google', async (user: User, err: any) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      const { accessToken, refreshToken } = await AuthService.authGoogleUser(user);
      res.redirect(`${process.env.CLIENT_URL}/login?accessToken=${accessToken}&refreshToken=${refreshToken}`);
    })(req, res, next);
  }

  async refreshAccessToken(req: Request, res: Response): Promise<Response> {
    const { refreshToken } = req.body;
    try {
      const userId = getUserIdFromRefreshToken(refreshToken);
      const accessToken = await AuthService.refreshAccessToken(refreshToken, Number(userId));
      return res.status(201).json({ accessToken });
    } catch (error) {
      return res.status(400).json({ error: 'Invalid refresh token.' });
    }
  }
}

export default new AuthController();
