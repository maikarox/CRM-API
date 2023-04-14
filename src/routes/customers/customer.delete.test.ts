import { Server } from 'http';
import { SuperAgentTest, Response } from 'supertest';
import { verify } from 'jsonwebtoken';

import { closeServer, startServer, testUserToken } from '../../jest-helpers';
import {
  getCustomerById,
  removeCustomer,
} from '../../services/Customer.service';

import { customerFixtureId } from './fixtures/customer';
import { Role } from '../../constants/roles.enum';

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

describe('DELETE /customers/:userId', () => {
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
        permissions: ['delete:all_customers'],
      });

      (verify as jest.Mock).mockImplementation(() => ({
        userId,
        email,
        roles: [Role.ADMIN],
        permissions: ['delete:all_customers'],
        expiresIn: 7000000000,
      }));

      (getCustomerById as jest.Mock).mockImplementationOnce(() => ({
        _id: customerFixtureId,
      }));

      result = await agent
        .delete(`/api/customers/${customerFixtureId}`)
        .set('Authorization', `Bearer ${token}`);
    });

    it('should call removeCustomer', () => {
      expect(removeCustomer).toHaveBeenCalledWith('61616e10fc13ae5c5f001c43');
    });

    it('should return 204', () => {
      expect(result.status).toEqual(204);
    });
  });

  describe('when the customer to delete does not exist', () => {
    let result: Response;
    const email = 'admin.test@email.com';
    const userId = 'userId';
    let token = '';

    beforeAll(async () => {
      token = testUserToken({
        userId,
        email,
        roles: [Role.ADMIN],
        permissions: ['delete:all_customers'],
      });

      (verify as jest.Mock).mockImplementation(() => ({
        userId,
        email,
        roles: [Role.ADMIN],
        permissions: ['delete:all_customers'],
        expiresIn: 7000000000,
      }));

      (getCustomerById as jest.Mock).mockImplementationOnce(() => null);

      result = await agent
        .delete(`/api/customers/61616e10fc13ae5c5f001c45`)
        .set('Authorization', `Bearer ${token}`);
    });

    it('should call getCustomerById with the correct params', () => {
      expect(getCustomerById).toHaveBeenCalledWith('61616e10fc13ae5c5f001c45');
    });

    it('should return 404', () => {
      expect(result.status).toEqual(404);
      expect(result.body).toEqual({
          message: 'Customer does not exist.'
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
        .delete(`/api/customers/${customerFixtureId}`)
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
        .delete(`/api/customers/${customerFixtureId}`)
        .set('Authorization', `Bearer invalid-token`);

      expect(result.status).toEqual(401);
    });
  });
});
