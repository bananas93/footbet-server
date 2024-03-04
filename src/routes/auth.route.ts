import { Router } from 'express';
import passport from 'passport';
import AuthController from '../controllers/auth.controller';
import AuthService from '../services/auth.service';
import { OAuth2Strategy as GoogleStrategy } from 'passport-google-oauth';

const router: Router = Router();

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: '/api/auth/callback',
    },
    async (_accessToken, _refreshToken, profile, done) => {
      const user = await AuthService.createOrFindGoogleUser(profile);
      done(null, user);
    },
  ),
);

router.post('/', async (req, res) => await AuthController.createUser(req, res)); // Create a new user
router.post('/login', async (req, res) => await AuthController.loginUser(req, res)); // Login user
router.put('/:id', async (req, res) => await AuthController.editUser(req, res)); // Edit user
router.post('/forgot-password', async (req, res) => await AuthController.forgotPassword(req, res)); // Forgot password
router.post('/change-password', async (req, res) => await AuthController.changePassword(req, res)); // Change password
router.post('/check-token', async (req, res) => await AuthController.checkResetToken(req, res)); // Check reset token
router.delete('/:id', async (req, res) => await AuthController.deleteUser(req, res)); // Delete user
router.get('/callback', passport.authenticate('google', { failureRedirect: '/' }), async (req, res, next) => {
  await AuthController.authGoogleUser(req, res, next);
}); // Google auth callback
router.post('/refresh', async (req, res) => await AuthController.refreshAccessToken(req, res)); // Refresh access token
router.get('/auth', passport.authenticate('google', { scope: ['profile', 'email'] })); // Google auth

export default router;
