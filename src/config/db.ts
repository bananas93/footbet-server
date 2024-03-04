import typeorm, { type DataSource } from 'typeorm';

let dataSource: DataSource;
if (process.env.NODE_ENV === 'production') {
  dataSource = new typeorm.DataSource({
    type: 'mysql',
    url: process.env.CLEARDB_DATABASE_URL,
    logging: false,
    synchronize: true,
    entities: ['src/entity/*.ts'],
  });
} else {
  dataSource = new typeorm.DataSource({
    type: 'mysql',
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT ?? '3306'),
    username: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    logging: false,
    synchronize: true,
    entities: ['src/entity/*.ts'],
  });
}

export default dataSource;
