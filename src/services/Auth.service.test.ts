import { sign } from 'jsonwebtoken';
import { db } from '../jest-helpers';
import { RoleModel, User } from '../models';
import { userFixture } from '../routes/users/fixtures/users';
import { rolesFixture } from '../routes/users/fixtures/roles';
import { AuthToken, createAccessToken } from './Auth.service';

jest.mock('jsonwebtoken');

beforeAll(async () => {
  db.connect();
  await RoleModel.insertMany(rolesFixture);
});

afterAll(async () => {
  await RoleModel.deleteOne({ _id: rolesFixture[0]._id });
  await RoleModel.deleteOne({ _id: rolesFixture[1]._id });
  
  await db.disconnect();
  
  jest.clearAllMocks();
});

describe('createAccessToken', () => {
  let accessToken: AuthToken;
  const now = 1487076708000;
  const token = 'some-token';
  let dateNowSpy: jest.SpyInstance<number, []>;

  beforeAll(async () => {
    (sign as jest.Mock).mockReturnValue(token);
    
    dateNowSpy = jest.spyOn(Date, 'now').mockImplementation(() => now);
    accessToken = await createAccessToken(userFixture as unknown as User);
  });

  afterAll(() => {
    dateNowSpy.mockRestore();
  });

  it('should call jwt sign with user auth data', () => {
    expect(sign).toHaveBeenCalledWith(
      {
        email: userFixture.email,
        permissions: ['permission1', 'permission2', 'permission3'],
        roles: ['Role-1'],
        userId: userFixture._id,
      },
      expect.any(String),
      { expiresIn: '24h' },
    );
  });

  it('should return the access token and the expiring date', () => {
    expect(accessToken.accessToken).toEqual('some-token');
    expect(accessToken.accessTokenExpiresOn).toEqual(now + 24 * 60 * 60 * 1000);
  });
});
