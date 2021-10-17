import { Server } from 'http';
import { SuperAgentTest, Response } from 'supertest';
import { verify } from 'jsonwebtoken';

import { closeServer, startServer, testUserToken } from '../../jest-helpers';
import { createCustomerProfile } from '../../services/Customer.service';
import { customerFixture } from './fixtures/customer';

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

describe('POST /customers', () => {
  describe('when token is valid and user has permissions', () => {
    let result: Response;
    const email = 'user.test@email.com';
    const userId = 'userId';
    let token = '';

    beforeAll(async () => {
      token = testUserToken({
        userId,
        email,
        roles: ['User'],
        permissions: ['create:all_customers'],
      });

      (verify as jest.Mock).mockImplementation(() => ({
        userId,
        email,
        roles: ['User'],
        permissions: ['create:all_customers'],
        expiresIn: 7000000000,
      }));

      result = await agent
        .post(`/api/customers`)
        .send(customerFixture)
        .set('Authorization', `Bearer ${token}`);
    });

    it('should call removeUser', () => {
      expect(createCustomerProfile).toBeCalledTimes(1);
    });

    it('should return 201', () => {
      expect(result.status).toEqual(201);
    });
  });

  describe('when required body params are not passed', () => {
    let result: Response;
    const email = 'user.test@email.com';
    const userId = 'userId';
    let token = '';

    beforeAll(async () => {
      token = testUserToken({
        userId,
        email,
        roles: ['User'],
        permissions: ['create:all_customers'],
      });

      (verify as jest.Mock).mockImplementation(() => ({
        userId,
        email,
        roles: ['User'],
        permissions: ['create:all_customers'],
        expiresIn: 7000000000,
      }));

      result = await agent
        .post(`/api/customers`)
        .send({ ...customerFixture, surname: undefined })
        .set('Authorization', `Bearer ${token}`);
    });

    it('should return 400', () => {
      expect(result.status).toEqual(400);
      expect(result.body).toEqual({
        message: 'Name and surname are required.',
      });
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
