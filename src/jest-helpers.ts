import express from 'express';
import { Server } from 'http';
import { sign } from 'jsonwebtoken';
import mongoose from 'mongoose';
import request from 'supertest';

import { configEnv } from './config/env';
import expressLoader from './loaders/express';

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

export const startServer = (
  server: Server,
  agent: request.SuperAgentTest,
): { agent: request.SuperAgentTest; server: Server } => {
  const app = express();
  expressLoader(app);
  server = app.listen();
  agent = request.agent(server);
  return { agent, server };
};

export const closeServer = async (server: Server): Promise<void> => {
  await server.close();
};
