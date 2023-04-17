import { Server } from 'http';
import { SuperAgentTest, Response } from 'supertest';
import { verify } from 'jsonwebtoken';

import { closeServer, startServer, testUserToken } from '../../jest-helpers';
import {
  softDeleteCustomer,
  getCustomerById,
  updateCustomerProfile,
} from '../../services/Customer.service';

import { customerFixtureId } from './fixtures/customer';
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

describe('UPDATE /customers/:userId/disable', () => {
  describe('when token is valid and user has permissions', () => {
    let result: Response;
    const email = 'user.test@email.com';
    const userId = 'userId';
    let token = '';

    beforeAll(async () => {
      jest.clearAllMocks();
      token = testUserToken({
        userId,
        email,
        roles: [Role.USER],
        permissions: ['update:all_customers'],
      });

      (verify as jest.Mock).mockImplementation(() => ({
        userId,
        email,
        roles: [Role.USER],
        permissions: ['update:all_customers'],
        expiresIn: 7000000000,
      }));

      (getCustomerById as jest.Mock).mockImplementationOnce(() => ({
        _id: customerFixtureId,
      }));

      result = await agent
        .patch(`/api/customers/${customerFixtureId}/disable`)
        .set('Authorization', `Bearer ${token}`);
    });

    it('should call softDeleteCustomer', () => {
      expect(softDeleteCustomer).toHaveBeenCalledWith('61616e10fc13ae5c5f001c43');
    });

    it('should return 200', () => {
      expect(result.status).toEqual(200);
    });
  });

  describe('when the customer to soft-delete does not exist', () => {
    let result: Response;
    const email = 'user.test@email.com';
    const userId = 'userId';
    let token = '';

    beforeAll(async () => {
      jest.clearAllMocks();

      token = testUserToken({
        userId,
        email,
        roles: [Role.USER],
        permissions: ['update:all_customers'],
      });

      (verify as jest.Mock).mockImplementation(() => ({
        userId,
        email,
        roles: [Role.USER],
        permissions: ['update:all_customers'],
        expiresIn: 7000000000,
      }));

      (getCustomerById as jest.Mock).mockImplementationOnce(() => null);

      result = await agent
        .patch(`/api/customers/61616e10fc13ae5c5f001c45/disable`)
        .set('Authorization', `Bearer ${token}`);
    });

    it('should call getCustomerById with the correct params', () => {
      expect(getCustomerById).toHaveBeenCalledWith('61616e10fc13ae5c5f001c45');
    });

    it('should return 404', () => {
      expect(result.status).toEqual(404);
      expect(result.body).toEqual({
        message: 'Customer does not exist.',
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
        .patch(`/api/customers/${customerFixtureId}/disable`)
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
        .patch(`/api/customers/${customerFixtureId}`)
        .set('Authorization', `Bearer invalid-token`);

      expect(result.status).toEqual(401);
    });
  });
});

describe('UPDATE /customers/:userId', () => {
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
        permissions: ['update:all_customers'],
      });

      (verify as jest.Mock).mockImplementation(() => ({
        userId,
        email,
        roles: [Role.USER],
        permissions: ['update:all_customers'],
        expiresIn: 7000000000,
      }));

      (getCustomerById as jest.Mock).mockImplementationOnce(() => ({
        _id: customerFixtureId,
      }));

      result = await agent
        .patch(`/api/customers/${customerFixtureId}`)
        .send({
          name: 'Customer name',
          surname: 'New Surname',
          customerId: customerFixtureId,
          actionUser: userId,
        })
        .set('Authorization', `Bearer ${token}`);
    });

    it('should call updateCustomerProfile', () => {
      expect(updateCustomerProfile).toHaveBeenCalledWith({
        actionUser: 'userId',
        customerId: '61616e10fc13ae5c5f001c43',
        name: 'Customer name',
        profileImage: undefined,
        surname: 'New Surname',
      });
    });

    it('should return 200', () => {
      expect(result.status).toEqual(200);
    });
  });

  describe('when the customer to update does not exist', () => {
    let result: Response;
    const email = 'admin.test@email.com';
    const userId = 'userId';
    let token = '';

    beforeAll(async () => {
      jest.clearAllMocks();

      token = testUserToken({
        userId,
        email,
        roles: [Role.ADMIN],
        permissions: ['update:all_customers'],
      });

      (verify as jest.Mock).mockImplementation(() => ({
        userId,
        email,
        roles: [Role.ADMIN],
        permissions: ['update:all_customers'],
        expiresIn: 7000000000,
      }));

      (getCustomerById as jest.Mock).mockImplementationOnce(() => null);

      result = await agent
        .patch(`/api/customers/61616e10fc13ae5c5f001c45`)
        .send({
          name: 'Customer name',
          customerId: customerFixtureId,
          actionUser: userId,
        })
        .set('Authorization', `Bearer ${token}`);
    });

    it('should call getCustomerById with the correct params', () => {
      expect(getCustomerById).toHaveBeenCalledWith('61616e10fc13ae5c5f001c45');
    });

    it('should return 404', () => {
      expect(result.status).toEqual(404);
      expect(result.body).toEqual({
        message: 'Customer does not exist.',
      });
    });
  });
  
  describe('when none of the require body params are passed', () => {
    let result: Response;
    const email = 'admin.test@email.com';
    const userId = 'userId';
    let token = '';

    beforeAll(async () => {
      jest.clearAllMocks();
      token = testUserToken({
        userId,
        email,
        roles: [Role.ADMIN],
        permissions: ['update:all_customers'],
      });

      (verify as jest.Mock).mockImplementation(() => ({
        userId,
        email,
        roles: [Role.ADMIN],
        permissions: ['update:all_customers'],
        expiresIn: 7000000000,
      }));

      (getCustomerById as jest.Mock).mockImplementationOnce(() => ({
        _id: customerFixtureId,
      }));

      result = await agent
        .patch(`/api/customers/${customerFixtureId}`)
        .send({
          customerId: customerFixtureId,
          actionUser: userId,
        })
        .set('Authorization', `Bearer ${token}`);
    });

    it('should return 400', () => {
      expect(result.status).toEqual(400);
      expect(result.body).toEqual({
        message:
          'Nothing to update, send at least one: name, surname or profileImage.',
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
        .patch(`/api/customers/${customerFixtureId}`)
        .send({
          name: 'Customer name',
          customerId: customerFixtureId,
          actionUser: userId,
        })
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
        .patch(`/api/customers/${customerFixtureId}`)
        .send({ name: 'Customer name', customerId: customerFixtureId })
        .set('Authorization', `Bearer invalid-token`);

      expect(result.status).toEqual(401);
    });
  });
});
