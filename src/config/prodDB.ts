import { DataSource } from 'typeorm';
import path from 'path';

const ProdAppDataSource = new DataSource({
  type: 'mysql',
  host: process.env.DB_HOST_PROD,
  port: parseInt(process.env.DB_PORT ?? '3306'),
  username: process.env.DB_USER_PROD,
  password: process.env.DB_PASS_PROD,
  database: process.env.DB_NAME_PROD,
  logging: false,
  synchronize: true,
  migrations: [path.join(__dirname, '/../migrations/*.{js,ts}')],
  entities: [path.join(__dirname, '/../entity/*.{js,ts}')],
});

export default ProdAppDataSource;
