import { Server } from 'http';
import { SuperAgentTest, Response } from 'supertest';

import { closeServer, startServer } from '../../jest-helpers';
import { getUser } from '../../services/User.service';
import { createAccessToken } from '../../services/Auth.service';
import { userFixture } from '../users/fixtures/users';

jest.mock('jsonwebtoken', () => ({
  sign: 'some-token',
}));
jest.mock('../../services/User.service');
jest.mock('../../services/Auth.service');

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

describe('POST /login', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('when the user and/or password does not match an exisiting user', () => {
    let result: Response;

    beforeAll(async () => {
      result = await agent
        .post('/api/login')
        .send({ email: 'user@email.com', password: 'some-password' });
    });

    it('should call getUser with the correct params', () => {
      expect(getUser).toBeCalledWith('user@email.com', 'some-password');
    });

    it('should return 401', () => {
      expect(result.status).toEqual(401);
      expect(result.body).toEqual({ message: 'Wrong email or password' });
    });
  });

  describe('when the user has been soft-deleted', () => {
    let result: Response;

    beforeAll(async () => {
      (getUser as jest.Mock).mockImplementationOnce(() => ({
        ...userFixture,
        deletedAt: new Date(),
      }));

      result = await agent
        .post('/api/login')
        .send({ email: userFixture.email, password: 'Pass-Test' });
    });

    it('should call getUser with the correct params', () => {
      expect(getUser).toBeCalledWith(userFixture.email, 'Pass-Test');
    });

    it('should return 401', () => {
      expect(result.status).toEqual(401);
      expect(result.body).toEqual({
        message: 'Your account has been disabled.',
      });
    });
  });

  describe('when the user is valid', () => {
    let result: Response;
    const accessToken = 'someToken'
    const accessTokenExpiresOn = "2021-10-15T08:48:38.877Z";
    beforeAll(async () => {
      (getUser as jest.Mock).mockImplementationOnce(() => userFixture);
      (createAccessToken as jest.Mock).mockImplementationOnce(() => ({
        accessToken,
        accessTokenExpiresOn,
      }));

      result = await agent
        .post('/api/login')
        .send({ email: userFixture.email, password: 'Pass-Test' });
    });

    it('should call createAccessToken with the correct params', () => {
      expect(createAccessToken).toBeCalledWith(userFixture);
    });

    it('should return 200', () => {
      expect(result.status).toEqual(200);
    });

    it('should return the access token', () => {
      expect(result.body).toEqual({
        accessToken,
        expiresIn: accessTokenExpiresOn,
      });
    });
  });
});
