import { verify } from 'jsonwebtoken';

jest.mock('jsonwebtoken');

describe('GET /users', () => {
  describe('when token is valid and user has the admin role', () => {
    const mockReq = { headers: { authorization: 'Bearer token' } };
    beforeAll(() => {
      (verify as jest.Mock).mockReturnValue({
        userId: '61616f99fc13ae4d5f11112f',
        email: 'admin@test.com',
        roles: ['User', 'Admin'],
        permissions: [
          'read:all_customers',
          'create:all_customers',
          'update:all_customers',
          'delete:all_customers',
          'read:all_users',
          'create:all_users',
          'update:all_users',
          'delete:all_users',
        ],
        iat: 1633826646,
        exp: 1633913046,
      });

      
    });
  });
});
