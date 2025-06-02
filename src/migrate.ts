/* eslint-disable @typescript-eslint/explicit-function-return-type */
import LocalDataSource from './config/db';
import ProdDataSource from './config/prodDB';
import { Match } from './entity/Match';

const migrateData = async () => {
  // Initialize data sources
  await ProdDataSource.initialize();
  await LocalDataSource.initialize();

  try {
    // Fetch all data from prod database
    const data = await ProdDataSource.getRepository(Match).find();

    // Insert data into dev database
    await LocalDataSource.getRepository(Match).save(data);

    console.log('Data migration completed successfully.');
  } catch (error) {
    console.error('Error during data migration:', error);
  } finally {
    // Close data sources
    await ProdDataSource.destroy();
    await LocalDataSource.destroy();
  }
};

migrateData()
  .then(() => process.exit(0))
  .catch(() => process.exit(1));
