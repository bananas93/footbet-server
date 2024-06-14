import { DataSource } from 'typeorm';
import path from 'path';

const AppDataSource = new DataSource({
  type: 'mysql',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT ?? '3306'),
  username: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  logging: false,
  synchronize: true,
  migrations: [path.join(__dirname, '/../migrations/*.{js,ts}')],
  entities: [path.join(__dirname, '/../entity/*.{js,ts}')],
  extra: {
    connectionLimit: 20, // Set the maximum number of connections in the pool
  },
});

export default AppDataSource;
