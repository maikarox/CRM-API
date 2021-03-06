import { verify } from 'jsonwebtoken';

import { configEnv } from '../config/env';

export interface JwtToken {
  userId: string;
  email: string;
  roles: string[];
  permissions: string[];
  iat: number;
  exp: number;
}

export function verifyToken(bearerToken: string): JwtToken {
  const token = bearerToken.split('Bearer ')[1];

  const decodedJwt = verify(token, Buffer.from(configEnv.SECRET, 'base64'));
  
  return decodedJwt as JwtToken;
}
