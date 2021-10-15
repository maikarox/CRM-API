// /* eslint-disable jest/no-done-callback */
import { Server } from 'http';
import request from 'supertest';
import { verify } from 'jsonwebtoken';

import {
  closeServer,
  db,
  startServer,
  testUserToken,
} from '../../jest-helpers';
import { UserModel } from '../../models';

import { userFixture, userFixtureId } from './fixtures/users';

jest.mock('jsonwebtoken');

let server: Server;
let agent: request.SuperAgentTest;

beforeAll(async () => {
  db.connect();
  await UserModel.deleteMany({});
  const agentServer = startServer(server, agent);
  server = agentServer.server;
  agent = agentServer.agent;
});

afterAll(async () => {
  await UserModel.deleteOne({ email: userFixture.email });
  await UserModel.create(userFixture);
  await db.disconnect();
  await closeServer(server);
});

describe('PATCH /users/:userId', () => {
  describe('when token is valid and user has permissions', () => {
    const email = 'admin.test@email.com';
    const userId = 'userId';
    let token = '';

    beforeAll(async () => {
      token = testUserToken({
        userId,
        email,
        roles: ['Admin'],
        permissions: ['update:all_users'],
      });

      (verify as jest.Mock).mockImplementation(() => ({
        userId,
        email,
        roles: ['Admin'],
        permissions: ['update:all_users'],
        expiresIn: 7000000000,
      }));
    });

    it('should return 200', async () => {
      const result = await agent
        .patch(`/api/users/${userFixtureId}`)
        .send({
          name: 'User test',
          surname: 'Surname',
          email: 'usertest@email.com',
          userId: userFixtureId,
        })
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
        .patch(`/api/users/${userFixtureId}`)
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
        .patch(`/api/users/${userFixtureId}`)
        .set('Authorization', `Bearer invalid-token`);

      expect(result.status).toEqual(401);
    });
  });
});

describe('PATCH /users/:userId/disable', () => {
  describe('when token is valid and user has permissions', () => {
    const email = 'admin.test@email.com';
    const userId = 'userId';
    let token = '';

    beforeAll(async () => {
      token = testUserToken({
        userId,
        email,
        roles: ['Admin'],
        permissions: ['update:all_users'],
      });

      (verify as jest.Mock).mockImplementation(() => ({
        userId,
        email,
        roles: ['Admin'],
        permissions: ['update:all_users'],
        expiresIn: 7000000000,
      }));
    });

    it('should return 200', async () => {
      const result = await agent
        .patch(`/api/users/${userFixtureId}/disable`)
        .send({
          userId: userFixtureId,
        })
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
        .patch(`/api/users/${userFixtureId}/disable`)
        .set('Authorization', `Bearer ${token}`);

      expect(result.status).toEqual(403);
    });
  });
});

describe('PATCH /users/:userId/grant/admin', () => {
  describe('when token is valid and user has permissions', () => {
    const email = 'admin.test@email.com';
    const userId = 'userId';
    let token = '';

    beforeAll(async () => {
      token = testUserToken({
        userId,
        email,
        roles: ['Admin'],
        permissions: ['update:all_admin'],
      });

      (verify as jest.Mock).mockImplementation(() => ({
        userId,
        email,
        roles: ['Admin'],
        permissions: ['update:all_admin'],
        expiresIn: 7000000000,
      }));
    });

    it('should return 200', async () => {
      const result = await agent
        .patch(`/api/users/${userFixtureId}/grant/admin`)
        .send({
          userId: userFixtureId,
        })
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
        .patch(`/api/users/${userFixtureId}/grant/admin`)
        .set('Authorization', `Bearer ${token}`);

      expect(result.status).toEqual(403);
    });
  });
});

describe('PATCH /users/:userId/revoke/admin', () => {
  describe('when token is valid and user has permissions', () => {
    const email = 'admin.test@email.com';
    const userId = 'userId';
    let token = '';

    beforeAll(async () => {
      token = testUserToken({
        userId,
        email,
        roles: ['Admin'],
        permissions: ['update:all_admin'],
      });

      (verify as jest.Mock).mockImplementation(() => ({
        userId,
        email,
        roles: ['Admin'],
        permissions: ['update:all_admin'],
        expiresIn: 7000000000,
      }));
    });

    it('should return 200', async () => {
      const result = await agent
        .patch(`/api/users/${userFixtureId}/revoke/admin`)
        .send({
          userId: userFixtureId,
        })
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
        .patch(`/api/users/${userFixtureId}/revoke/admin`)
        .set('Authorization', `Bearer ${token}`);

      expect(result.status).toEqual(403);
    });
  });
});
