/* eslint-disable jest/no-done-callback */
// import express from 'express';
import { Server } from 'http';
import request from 'supertest';
import { verify } from 'jsonwebtoken';

import { closeServer, db, startServer, testUserToken } from '../../jest-helpers';
import { UserModel } from '../../models';

jest.mock('jsonwebtoken');

let server: Server;
let agent: request.SuperAgentTest;

beforeAll(() => {
  db.connect();
  const agentServer = startServer(server, agent);
  server = agentServer.server;
  agent = agentServer.agent
});

afterAll(async () => {
  await db.disconnect();
  await closeServer(server);
});

describe('POST /users', () => {
  describe('when token is valid and user has permissions', () => {
    const email = 'admin.test@email.com';
    const userId = 'userId';
    let token = '';
    
    beforeAll(async () => {
      token = testUserToken({
        userId,
        email,
        roles: ['Admin'],
        permissions: ['create:all_users'],
      });

      (verify as jest.Mock).mockImplementation(() => ({
        userId,
        email,
        roles: ['Admin'],
        permissions: ['create:all_users'],
        expiresIn: 7000000000,
      }));
    });

    afterAll(async () => {
      await UserModel.deleteOne({email: 'usertest@email.com'});
    });

    it('should create the user', async () => {
      const result = await agent
        .post(`/api/users`)
        .send({
            name: 'User test',
            surname: 'Surname',
            email: 'usertest@email.com',
            password: 'Somepassword'
        })
        .set('Authorization', `Bearer ${token}`);

      expect(result.status).toEqual(201);
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
        .post(`/api/users`)
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
        .post(`/api/users`)
        .set('Authorization', `Bearer invalid-token`);

      expect(result.status).toEqual(401);
    });
  });
});
