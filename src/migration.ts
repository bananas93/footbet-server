/* eslint-disable @typescript-eslint/explicit-function-return-type */
import LocalDataSource from './config/db';
import ProdDataSource from './config/prodDB';
import { Achievement } from './entity/Achievement';

const migrateData = async () => {
  // Initialize data sources
  await LocalDataSource.initialize();
  await ProdDataSource.initialize();

  try {
    // Fetch all data from local database
    const data = await LocalDataSource.getRepository(Achievement).find();

    // Insert data into production database
    await ProdDataSource.getRepository(Achievement).save(data);

    console.log('Data migration completed successfully.');
  } catch (error) {
    console.error('Error during data migration:', error);
  } finally {
    // Close data sources
    await LocalDataSource.destroy();
    await ProdDataSource.destroy();
  }
};

migrateData()
  .then(() => process.exit(0))
  .catch(() => process.exit(1));
