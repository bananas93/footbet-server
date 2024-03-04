import express, { type Express } from 'express';
import 'dotenv/config';
import cors from 'cors';
import authRoute from './routes/auth.route';
import { AppDataSource } from './config/db';

const app: Express = express();

// Rest of your code...
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

app.use('/api/auth', authRoute);

app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});
