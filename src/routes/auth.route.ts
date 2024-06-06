import { Router } from 'express';
import { Passport } from 'passport';
import { OAuth2Strategy as GoogleStrategy } from 'passport-google-oauth';
import AuthController from '../controllers/auth.controller';
import AuthService from '../services/auth.service';
import checkAuth from '../middlewares/auth.middleware';

const router: Router = Router();

const passport = new Passport();

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: '/api/auth/callback',
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const user = await AuthService.createOrFindGoogleUser(profile);
        done(null, user);
      } catch (err) {
        done(err, null);
      }
    },
  ),
);

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((user, done) => {
  done(null, user);
});

router.get('/auth', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get(
  '/callback',
  passport.authenticate('google', { session: false, failureRedirect: '/login' }),
  async (req, res, next) => {
    await AuthController.authGoogleUser(req, res, next);
  },
);

router.post('/', async (req, res) => await AuthController.createUser(req, res)); // Create a new user
router.post('/login', async (req, res) => await AuthController.loginUser(req, res)); // Login user
router.get('/', checkAuth, async (req, res) => await AuthController.getUsers(req, res)); // Get all users
router.get('/:id', checkAuth, async (req, res) => await AuthController.getUser(req, res)); // Get user
router.put('/:id', checkAuth, async (req, res) => await AuthController.editUser(req, res)); // Edit user
router.post('/forgot-password', async (req, res) => await AuthController.forgotPassword(req, res)); // Forgot password
router.post('/change-password', async (req, res) => await AuthController.changePassword(req, res)); // Change password
router.post('/check-token', async (req, res) => await AuthController.checkResetToken(req, res)); // Check reset token
router.delete('/:id', checkAuth, async (req, res) => await AuthController.deleteUser(req, res)); // Delete user

router.post('/refresh', async (req, res) => await AuthController.refreshAccessToken(req, res)); // Refresh access token

export default router;
