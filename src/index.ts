import express, { type Express } from 'express';
// import i18next from 'i18next';
// import localizationMiddleware from 'i18next-http-middleware';
import 'dotenv/config';
import cors from 'cors';
import authRoute from './routes/auth.route';
import userRoute from './routes/user.route';
// import languageRoute from './routes/language.route';
import tournamentRoute from './routes/tournament.route';
import teamRoute from './routes/team.route';
import matchRoute from './routes/match.route';
import predictRoute from './routes/predict.route';
import roomRoute from './routes/room.route';
import leaderboardRoute from './routes/leaderboard.route';
import { AppDataSource } from './config/db';
import path from 'path';

// i18next
//   .use(localizationMiddleware.LanguageDetector)
//   .init({
//     fallbackLng: ['en', 'uk'],
//     preload: ['en', 'uk'],
//     resources: {
//       en: require('./locales/en.json'),
//       uk: require('./locales/uk.json'),
//     },
//   })
//   .then(() => {
//     console.log('i18next initialized');
//   })
//   .catch((error) => {
//     console.log(error);
//   });

const app: Express = express();

// app.use(
//   localizationMiddleware.handle(i18next, {
//     removeLngFromUrl: false,
//   }),
// );

const port = process.env.PORT ?? '3000';

AppDataSource.initialize()
  .then(() => {
    console.log('[db]: Database connected');
  })
  .catch((error) => {
    console.log(error);
  });

app.use(express.json());
app.disable('x-powered-by');
app.use(
  cors({
    allowedHeaders: ['sessionId', 'Content-Type'],
    exposedHeaders: ['sessionId, Content-Type'],
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    preflightContinue: true,
  }),
);
app.options('*', cors());

const adminBuildPath = path.join(__dirname, 'admin/build');
const clientBuildPath = path.join(__dirname, 'client/build');

app.use(express.static(clientBuildPath));
app.use(express.static(adminBuildPath));

app.use((req, res, next) => {
  console.log(`Received request: ${req.method} ${req.url}`);
  next();
});

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api/auth', authRoute);
app.use('/api/tournament', tournamentRoute);
app.use('/api/team', teamRoute);
app.use('/api/match', matchRoute);
app.use('/api/leaderboard', leaderboardRoute);
app.use('/api/predict', predictRoute);
app.use('/api/room', roomRoute);
// app.use('/api/language', languageRoute);
app.use('/api/user', userRoute);

// Serve admin build
app.get('/admin/*', (req, res) => {
  res.sendFile(path.join(adminBuildPath, 'index.html'));
});

// Serve client build
app.get('/*', (req, res) => {
  res.sendFile(path.join(clientBuildPath, 'index.html'));
});

app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});
