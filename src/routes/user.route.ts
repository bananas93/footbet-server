import { Router } from 'express';
import UserController from '../controllers/user.controller';
import checkAuth from '../middlewares/auth.middleware';
import upload from '../utils/storage';

const router: Router = Router();

router.get('/', checkAuth, async (req, res) => {
  await UserController.getUserProfile(req, res);
});

router.get('/:userId/:tournamentId', checkAuth, async (req, res) => {
  await UserController.getUserPublicProfile(req, res);
});

router.put('/', checkAuth, upload.single('avatar'), async (req, res) => {
  await UserController.editUserProfile(req, res);
});

router.put('/password', checkAuth, async (req, res) => {
  await UserController.changePassword(req, res);
});

export default router;
