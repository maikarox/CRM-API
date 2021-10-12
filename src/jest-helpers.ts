import { sign } from 'jsonwebtoken';
import mongoose from 'mongoose';

import { configEnv } from './config/env';

export const testUserToken = ({
  userId,
  email,
  roles,
  permissions,
}: {
  userId: string;
  email: string;
  roles: string[];
  permissions: string[];
}): string => {
  let token: string;
  const privateKey = 'AHt0$%&!7F%fdsa9872sSTdaWF';
  try {
    token = sign(
      {
        userId,
        email,
        roles,
        permissions,
      },
      privateKey,
      {
        expiresIn: '24h',
      },
    );
    return token;
  } catch (err) {
    console.log('Could not create token');
    throw new Error(err);
  }
};

const connectDB = async (): Promise<void> => {
  try {
    await mongoose.connect(configEnv.MONGODB_URI);
  } catch (err) {
    console.log(`Could not connect to the database ${err}`);
  }
};

const disconnectDB = async (): Promise<void> => {
  try {
    await mongoose.disconnect();
  } catch (err) {
    console.log('Could not disconnect');
  }
};

export const db = {
  connect: connectDB,
  disconnect: disconnectDB,
};
