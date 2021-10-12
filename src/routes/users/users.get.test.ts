/* eslint-disable jest/no-done-callback */
import express from 'express';
import { Server } from 'http';
import request from 'supertest';
import { verify } from 'jsonwebtoken';

import expressLoader from '../../loaders/express';
import { db, testUserToken } from '../../jest-helpers';

jest.mock('jsonwebtoken');

let server: Server;
const startServer = (): request.SuperAgentTest => {
  const app = express();
  expressLoader(app);
  server = app.listen();
  const agent = request.agent(server);
  return agent;
};

const closeServer = async (): Promise<void> => {
  await server.close();
};

const agent = startServer();
beforeAll(() => {
  db.connect();
  startServer();
});

afterAll(async () => {
  await db.disconnect();
  await closeServer();
});

describe('GET /users', () => {
  describe('when token is valid and user has permissions', () => {
    const email = 'admin.test@email.com';
    const userId = 'userId';
    let token = '';
    
    beforeAll(() => {
      token = testUserToken({
        userId,
        email,
        roles: ['Admin'],
        permissions: ['read:all_users'],
      });

      (verify as jest.Mock).mockImplementation(() => ({
        userId,
        email,
        roles: ['Admin'],
        permissions: ['read:all_users'],
        expiresIn: 7000000000,
      }));
    });

    it('should return all users', async () => {
      const result = await agent
        .get(`/api/users`)
        .set('Authorization', `Bearer ${token}`);

      expect(result.status).toEqual(200);
    });
  });

  describe('when token is valid but user does not have permissions', () => {
    const email = 'user.test@email.com';
    const userId = 'userId';
    let token = '';

    beforeAll(() => {
      token = testUserToken({
        userId,
        email,
        roles: ['User'],
        permissions: ['other:permission'],
      });

      (verify as jest.Mock).mockImplementation(() => ({
        userId,
        email,
        roles: ['User'],
        permissions: ['other:permission'],
        expiresIn: 7000000000,
      }));
    });

    it('should return 403', async () => {
      const result = await agent
        .get(`/api/users`)
        .set('Authorization', `Bearer ${token}`);

      expect(result.status).toEqual(403);
    });
  });

  describe('when token is invalid', () => {
    beforeAll(() => {
     (verify as jest.Mock).mockImplementation(() => ({}));
    });

    it('should return 401', async () => {
      const result = await agent
        .get(`/api/users`)
        .set('Authorization', `Bearer invalid-token`);

      expect(result.status).toEqual(401);
    });
  });
});
