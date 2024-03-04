import express, { type Express, type Request, type Response } from 'express';
import dotenv from 'dotenv';
import cors from 'cors';

dotenv.config();
const app: Express = express();
const port = process.env.PORT ?? '3000';

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

app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});
