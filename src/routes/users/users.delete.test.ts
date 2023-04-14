import { Server } from 'http';
import { SuperAgentTest, Response } from 'supertest';
import { verify } from 'jsonwebtoken';

import {
  closeServer,
  startServer,
  testUserToken,
} from '../../jest-helpers';
import { getUserById, removeUser } from '../../services/User.service';

import { userFixture, userFixtureId } from './fixtures/users';
import { Role } from '../../constants/roles.enum';

jest.mock('jsonwebtoken');
jest.mock('../../services/User.service');

let server: Server;
let agent: SuperAgentTest;

beforeAll(() => {
  const agentServer = startServer(server, agent);
  server = agentServer.server;
  agent = agentServer.agent;
});

afterAll(async () => {
  await closeServer(server);
});

describe('DELETE /users/:userId', () => {
  describe('when token is valid and user has permissions', () => {
    let result: Response;
    const email = 'admin.test@email.com';
    const userId = 'userId';
    let token = '';

    beforeAll(async () => {
      token = testUserToken({
        userId,
        email,
        roles: [Role.ADMIN],
        permissions: ['delete:all_users'],
      });

      (getUserById as jest.Mock).mockImplementationOnce(() => ({
        _id: userFixture._id,
      }));

      (verify as jest.Mock).mockImplementation(() => ({
        userId,
        email,
        roles: [Role.ADMIN],
        permissions: ['delete:all_users'],
        expiresIn: 7000000000,
      }));

      result = await agent
        .delete(`/api/users/${userFixtureId}`)
        .set('Authorization', `Bearer ${token}`);
    });

    it('should call removeUser', () => {
      expect(removeUser).toHaveBeenCalledWith('61616e10fc13ae4d5f000c32');
    });

    it('should return 204', () => {
      expect(result.status).toEqual(204);
    });
  });

  describe('when the user to delete does not exist', () => {
    let result: Response;
    const email = 'admin.test@email.com';
    const userId = '61616e10fc13ae4d5f333c32';
    let token = '';

    beforeAll(async () => {
      jest.clearAllMocks();

      token = testUserToken({
        userId,
        email,
        roles: [Role.ADMIN],
        permissions: ['delete:all_users'],
      });

      (verify as jest.Mock).mockImplementation(() => ({
        userId,
        email,
        roles: [Role.ADMIN],
        permissions: ['delete:all_users'],
        expiresIn: 7000000000,
      }));

      (getUserById as jest.Mock).mockImplementationOnce(() => null);

      result = await agent
        .delete(`/api/users/61616e10fc13ae4d5f333c32`)
        .set('Authorization', `Bearer ${token}`);
    });

    it('should call getUserById with the correct params', () => {
      expect(getUserById).toBeCalledWith('61616e10fc13ae4d5f333c32');
    });

    it('should return 404', () => {
      expect(result.status).toEqual(404);
      expect(result.body).toEqual({
        message: 'User not found.'
      })
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
        roles: [Role.USER],
        permissions: ['other:permission'],
      });

      (verify as jest.Mock).mockImplementation(() => ({
        userId,
        email,
        roles: [Role.USER],
        permissions: ['other:permission'],
        expiresIn: 7000000000,
      }));
    });

    it('should return 403', async () => {
      const result = await agent
        .delete(`/api/users/${userFixtureId}`)
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
        .delete(`/api/users/${userFixtureId}`)
        .set('Authorization', `Bearer invalid-token`);

      expect(result.status).toEqual(401);
    });
  });
});
