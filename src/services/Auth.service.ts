import jwt from 'jsonwebtoken';

import { configEnv } from '../config/env';
import { User, RoleModel } from '../models';

export interface AuthToken {
  accessToken: string;
  accessTokenExpiresOn: number;
}

export async function createAccessToken(user: User): Promise<AuthToken> {
  const { SECRET } = configEnv;

  const roles = await RoleModel.find({ _id: { $in: [...user.roles] } });

  const expiresIn = new Date(Date.now() + 24 * 60 * 60 * 1000);

  const token = jwt.sign(
    {
      userId: user._id,
      email: user.email,
      roles: roles.map(role => role.name),
      permissions: roles.reduce((prev, current) => {
        return [...prev, ...current.permissions];
      }, []),
    },
    SECRET,
    { expiresIn: '24h' },
  );

  return {
    accessToken: token,
    accessTokenExpiresOn: expiresIn.getTime(),
  };
}
