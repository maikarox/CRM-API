import express from 'express';

import expressLoader from './loaders/express';
import { configEnv } from './config/env';
import logger from './config/logger';
import { connectDB } from './config/db';

const runServer = async () => {
  await connectDB();

  if (!configEnv.PORT) {
    process.exit(1);
  }

  const PORT: number = parseInt(configEnv.PORT as string, 10);

  const app = express();

  expressLoader(app);

  /**
   * Server Activation
   */
  app.listen(PORT, () => {
    logger.info(`Listening on port ${PORT}`);
  });
};

runServer();
