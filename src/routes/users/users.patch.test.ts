import { Server } from 'http';
import { SuperAgentTest, Response } from 'supertest';
import { verify } from 'jsonwebtoken';

import { closeServer, startServer, testUserToken } from '../../jest-helpers';
import {
  softDeleteUser,
  getUserById,
  updateUserProfile,
  grantAdminRole,
  revokeAdminRole
} from '../../services/User.service';

import { userFixtureId } from './fixtures/users';
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

describe('PATCH /users/:userId', () => {
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
        permissions: ['update:all_users'],
      });

      (verify as jest.Mock).mockImplementation(() => ({
        userId,
        email,
        roles: [Role.ADMIN],
        permissions: ['update:all_users'],
        expiresIn: 7000000000,
      }));

      (getUserById as jest.Mock).mockImplementationOnce(() => ({
        _id: userFixtureId,
      }));

      (updateUserProfile as jest.Mock).mockImplementationOnce(() => ({
        _id: userFixtureId,
      }));

      result = await agent
        .patch(`/api/users/${userFixtureId}`)
        .send({
          name: 'User test',
          surname: 'Surname',
          email: 'usertest@email.com',
          userId: userFixtureId,
        })
        .set('Authorization', `Bearer ${token}`);
    });

    it('should call getUserById with the correct params', () => {
      expect(getUserById).toBeCalledWith('61616e10fc13ae4d5f000c32');
    });

    it('should call updateUserProfile with the correct params', () => {
      expect(updateUserProfile).toHaveBeenCalledWith({
        email: 'usertest@email.com',
        name: 'User test',
        password: undefined,
        surname: 'Surname',
        userId: '61616e10fc13ae4d5f000c32',
      });
    });

    it('should return 200', () => {
      expect(result.status).toEqual(200);
    });
  });

  describe('when the user to update does not exist', () => {
    let result: Response;
    const email = 'admin.test@email.com';
    const userId = '61616e10fc13ae4d5f333c32';
    let token = '';

    beforeAll(async () => {
      token = testUserToken({
        userId,
        email,
        roles: [Role.ADMIN],
        permissions: ['update:all_users'],
      });

      (verify as jest.Mock).mockImplementation(() => ({
        userId,
        email,
        roles: [Role.ADMIN],
        permissions: ['update:all_users'],
        expiresIn: 7000000000,
      }));

      (getUserById as jest.Mock).mockImplementationOnce(() => null);

      result = await agent
        .patch(`/api/users/61616e10fc13ae4d5f333c32`)
        .send({
          name: 'User test',
          surname: 'Surname',
          email: 'usertest@email.com',
          userId: '61616e10fc13ae4d5f333c32',
        })
        .set('Authorization', `Bearer ${token}`);
    });

    it('should call getUserById with the correct params', () => {
      expect(getUserById).toBeCalledWith('61616e10fc13ae4d5f333c32');
    });

    it('should return 404', () => {
      expect(result.status).toEqual(404);
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
  afterEach(() => {
    jest.clearAllMocks();
  });

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
        permissions: ['update:all_users'],
      });

      (verify as jest.Mock).mockImplementation(() => ({
        userId,
        email,
        roles: [Role.ADMIN],
        permissions: ['update:all_users'],
        expiresIn: 7000000000,
      }));

      (getUserById as jest.Mock).mockImplementationOnce(() => ({
        _id: userFixtureId,
      }));

      result = await agent
        .patch(`/api/users/${userFixtureId}/disable`)
        .send({
          userId: userFixtureId,
        })
        .set('Authorization', `Bearer ${token}`);
    });

    it('should call softDeleteUser with the correctParams', () => {
      expect(softDeleteUser).toBeCalledWith('61616e10fc13ae4d5f000c32');
    });

    it('should return 200', () => {
      expect(result.status).toEqual(200);
    });
  });

  describe('when the user to soft-delete does not exist', () => {
    let result: Response;
    const email = 'admin.test@email.com';
    const userId = 'userId';
    let token = '';

    beforeAll(async () => {
      token = testUserToken({
        userId,
        email,
        roles: [Role.ADMIN],
        permissions: ['update:all_users'],
      });

      (verify as jest.Mock).mockImplementation(() => ({
        userId,
        email,
        roles: [Role.ADMIN],
        permissions: ['update:all_users'],
        expiresIn: 7000000000,
      }));

      (getUserById as jest.Mock).mockImplementationOnce(() => null);

      result = await agent
        .patch('/api/users/61616e10fc13ae4d5f333c32/disable')
        .send({
          userId: userFixtureId,
        })
        .set('Authorization', `Bearer ${token}`);
    });

    it('should call softDeleteUser with the correctParams', () => {
      expect(getUserById).toBeCalledWith('61616e10fc13ae4d5f333c32');
    });

    it('should return 404', () => {
      expect(result.status).toEqual(404);
      expect(result.body).toEqual({
        message: 'User not found.',
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
        .patch(`/api/users/${userFixtureId}/disable`)
        .set('Authorization', `Bearer ${token}`);

      expect(result.status).toEqual(403);
    });
  });
});

describe('PATCH /users/:userId/grant/admin', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

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
        permissions: ['update:all_admins'],
      });

      (verify as jest.Mock).mockImplementation(() => ({
        userId,
        email,
        roles: [Role.ADMIN],
        permissions: ['update:all_admins'],
        expiresIn: 7000000000,
      }));

      (getUserById as jest.Mock).mockImplementationOnce(() => ({
        _id: userFixtureId,
      }));

      result = await agent
        .patch(`/api/users/${userFixtureId}/grant/admin`)
        .send({
          userId: userFixtureId,
        })
        .set('Authorization', `Bearer ${token}`);
    });

    it('should call grantAdminRole with the correct params', () => {
      expect(grantAdminRole).toHaveBeenCalledWith('61616e10fc13ae4d5f000c32');
    });

    it('should return 200', () => {
      expect(result.status).toEqual(200);
    });
  });

  describe('when the user to grant admin does not exist', () => {
    let result: Response;
    const email = 'admin.test@email.com';
    const userId = 'userId';
    let token = '';

    beforeAll(async () => {
      token = testUserToken({
        userId,
        email,
        roles: [Role.ADMIN],
        permissions: ['update:all_admins'],
      });

      (verify as jest.Mock).mockImplementation(() => ({
        userId,
        email,
        roles: [Role.ADMIN],
        permissions: ['update:all_admins'],
        expiresIn: 7000000000,
      }));

      (getUserById as jest.Mock).mockImplementationOnce(() => null);

      result = await agent
        .patch('/api/users/61616e10fc13ae4d5f333c32/grant/admin')
        .send({
          userId: userFixtureId,
        })
        .set('Authorization', `Bearer ${token}`);
    });

    it('should call grantAdminRole with the correct params', () => {
      expect(getUserById).toBeCalledWith('61616e10fc13ae4d5f333c32');
    });

    it('should return 404', () => {
      expect(result.status).toEqual(404);
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
        .patch(`/api/users/${userFixtureId}/grant/admin`)
        .set('Authorization', `Bearer ${token}`);

      expect(result.status).toEqual(403);
    });
  });
});

describe('PATCH /users/:userId/revoke/admin', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

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
        permissions: ['update:all_admins'],
      });

      (verify as jest.Mock).mockImplementation(() => ({
        userId,
        email,
        roles: [Role.ADMIN],
        permissions: ['update:all_admins'],
        expiresIn: 7000000000,
      }));

      (getUserById as jest.Mock).mockImplementationOnce(() => ({
        _id: userFixtureId,
      }));

      result = await agent
        .patch(`/api/users/${userFixtureId}/revoke/admin`)
        .send({
          userId: userFixtureId,
        })
        .set('Authorization', `Bearer ${token}`);
    });

    it('should call revokeAdminRole with the correct params', () => {
      expect(revokeAdminRole).toBeCalledWith('61616e10fc13ae4d5f000c32');
    });

    it('should return 200', () => {
      expect(result.status).toEqual(200);
    });
  });

  describe('when the user to revoke admin does not exist', () => {
    let result: Response;
    const email = 'admin.test@email.com';
    const userId = 'userId';
    let token = '';

    beforeAll(async () => {
      token = testUserToken({
        userId,
        email,
        roles: [Role.ADMIN],
        permissions: ['update:all_admins'],
      });

      (verify as jest.Mock).mockImplementation(() => ({
        userId,
        email,
        roles: [Role.ADMIN],
        permissions: ['update:all_admins'],
        expiresIn: 7000000000,
      }));

      (getUserById as jest.Mock).mockImplementationOnce(() => null);

      result = await agent
        .patch('/api/users/61616e10fc13ae4d5f333c32/revoke/admin')
        .send({
          userId: userFixtureId,
        })
        .set('Authorization', `Bearer ${token}`);
    });

    it('should call getUserById with the correct params', () => {
      expect(getUserById).toBeCalledWith('61616e10fc13ae4d5f333c32');
    });

    it('should return 404', async () => {
      expect(result.status).toEqual(404);
      expect(result.body).toEqual({
        message: 'User not found.'
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
        .patch(`/api/users/${userFixtureId}/revoke/admin`)
        .set('Authorization', `Bearer ${token}`);

      expect(result.status).toEqual(403);
    });
  });
});
