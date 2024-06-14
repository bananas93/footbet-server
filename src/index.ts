import express, { type Express } from 'express';
import 'dotenv/config';
import cors from 'cors';
import authRoute from './routes/auth.route';
import userRoute from './routes/user.route';
import tournamentRoute from './routes/tournament.route';
import teamRoute from './routes/team.route';
import matchRoute from './routes/match.route';
import predictRoute from './routes/predict.route';
import roomRoute from './routes/room.route';
import leaderboardRoute from './routes/leaderboard.route';
import AppDataSource from './config/db';
import path from 'path';
import http from 'http';
import { setupSocket } from './socket';

const app: Express = express();

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

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/api/auth', authRoute);
app.use('/api/tournament', tournamentRoute);
app.use('/api/team', teamRoute);
app.use('/api/match', matchRoute);
app.use('/api/leaderboard', leaderboardRoute);
app.use('/api/predict', predictRoute);
app.use('/api/room', roomRoute);
app.use('/api/user', userRoute);

// Serve admin build
app.get('/admin/*', (req, res) => {
  res.sendFile(path.join(adminBuildPath, 'index.html'));
});

// Serve client build
app.get('/*', (req, res) => {
  res.sendFile(path.join(clientBuildPath, 'index.html'));
});

const server = http.createServer(app);
setupSocket(server);

server.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});
