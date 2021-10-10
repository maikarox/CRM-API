/* eslint-disable no-empty */
import { RequestHandler } from 'express';

import { verifyToken } from './helpers/decodeToken';

export const isAuthorized: RequestHandler = async (req, res, next) => {
  const { authorization } = req.headers;

  let decodedJwt = null;
  try {
    decodedJwt = verifyToken(authorization);
  } catch {}

  const noValidToken =
    !decodedJwt ||
    (typeof decodedJwt === 'object' && !Object.keys(decodedJwt).length);

  if (noValidToken) {
    return res.status(401).json({ message: 'Unauthorized: Need to login.' });
  }

  return next();
};
