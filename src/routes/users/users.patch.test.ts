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

import { user2Fixture, user2FixtureId } from './fixtures/users';

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
  await UserModel.deleteOne({ email: user2Fixture.email });
  await UserModel.create(user2Fixture);
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
        .patch(`/api/users/${user2FixtureId}`)
        .send({
          name: 'User test',
          surname: 'Surname',
          email: 'usertest@email.com',
          userId: user2FixtureId,
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
        .patch(`/api/users/${user2FixtureId}`)
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
        .patch(`/api/users/${user2FixtureId}`)
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
        .patch(`/api/users/${user2FixtureId}/disable`)
        .send({
          userId: user2FixtureId,
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
        .patch(`/api/users/${user2FixtureId}/disable`)
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
        .patch(`/api/users/${user2FixtureId}/grant/admin`)
        .send({
          userId: user2FixtureId,
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
        .patch(`/api/users/${user2FixtureId}/grant/admin`)
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
        .patch(`/api/users/${user2FixtureId}/revoke/admin`)
        .send({
          userId: user2FixtureId,
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
        .patch(`/api/users/${user2FixtureId}/revoke/admin`)
        .set('Authorization', `Bearer ${token}`);

      expect(result.status).toEqual(403);
    });
  });
});
