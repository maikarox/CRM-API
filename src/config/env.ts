import * as dotenv from 'dotenv';

dotenv.config();

export const configEnv = {
  PORT: process.env.PORT,
  MONGODB_URI: process.env.MONGODB_URI,
  NODE_ENV: process.env.NODE_ENV || 'dev',
  SECRET: process.env.SECRET,
};
