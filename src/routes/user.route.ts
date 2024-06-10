import { Router } from 'express';
import UserController from '../controllers/user.controller';
import checkAuth from '../middlewares/auth.middleware';
import upload from '../utils/storage';

const router: Router = Router();

router.get('/', checkAuth, async (req, res) => {
  await UserController.getUserProfile(req, res);
});

router.put('/', checkAuth, upload.single('avatar'), async (req, res) => {
  await UserController.editUserProfile(req, res);
});

export default router;
