import { Server } from 'http';
import { SuperAgentTest, Response } from 'supertest';
import { verify } from 'jsonwebtoken';

import { closeServer, startServer, testUserToken } from '../../jest-helpers';
import {
  getAllCustomers,
} from '../../services/Customer.service';
import { Role } from '../../constants/roles';

jest.mock('jsonwebtoken');
jest.mock('../../services/Customer.service');

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

describe('GET /customers', () => {
  describe('when token is valid and user has permissions', () => {
    let result: Response;
    const email = 'user.test@email.com';
    const userId = 'userId';
    let token = '';

    beforeAll(async () => {
      token = testUserToken({
        userId,
        email,
        roles: [Role.USER],
        permissions: ['read:all_customers'],
      });

      (verify as jest.Mock).mockImplementation(() => ({
        userId,
        email,
        roles: [Role.USER],
        permissions: ['read:all_customers'],
        expiresIn: 7000000000,
      }));

      result = await agent
        .get(`/api/customers`)
        .set('Authorization', `Bearer ${token}`);
    });

    it('should call getAllCustomers', () => {
      expect(getAllCustomers).toBeCalledTimes(1);
    });

    it('should return 200', () => {
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
        .get(`/api/customers`)
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
        .get(`/api/customers`)
        .set('Authorization', `Bearer invalid-token`);

      expect(result.status).toEqual(401);
    });
  });
});
