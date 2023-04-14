import { Server } from 'http';
import { SuperAgentTest, Response } from 'supertest';
import { verify } from 'jsonwebtoken';

import { closeServer, startServer, testUserToken } from '../../jest-helpers';
import { getAllUsers } from '../../services/User.service';
import { userFixture } from './fixtures/users';
import { Role } from '../../constants/roles.enum';

jest.mock('jsonwebtoken');
jest.mock('../../services/User.service');

let server: Server;
let agent: SuperAgentTest;

beforeAll(() => {
  const agentServer = startServer(server, agent);
  server = agentServer.server;
  agent = agentServer.agent
});

afterAll(async () => {
  jest.clearAllMocks()
  await closeServer(server);
});

describe('GET /users', () => {
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
        permissions: ['read:all_users'],
      });

      (verify as jest.Mock).mockImplementation(() => ({
        userId,
        email,
        roles: [Role.ADMIN],
        permissions: ['read:all_users'],
        expiresIn: 7000000000,
      }));

      (getAllUsers as jest.Mock).mockImplementationOnce(() => [userFixture]);

      result = await agent
        .get(`/api/users`)
        .set('Authorization', `Bearer ${token}`);
    });

    it('should call getAllUsers', () => {
      expect(getAllUsers).toBeCalledTimes(1);
    });

    it('should return all users', () => {
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
