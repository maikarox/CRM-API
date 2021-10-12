import { connect } from 'mongoose';

import { configEnv } from '../config/env';
import logger from '../config/logger';

export async function connectDB(): Promise<void> {
  const { MONGODB_URI } = configEnv;

  try {
    await connect(MONGODB_URI);

    logger.info('Connected to the database!');
  } catch (err) {
    logger.error('Could not connect to the database.', err);
    process.exit(1);
  }
}
