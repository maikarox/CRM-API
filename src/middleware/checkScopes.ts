import { RequestHandler } from 'express';

import { verifyToken } from '../helpers/decodeToken';

export const checkScopes =
  (requiredPermissions: string[]): RequestHandler =>
  (req, res, next) => {
    const { authorization } = req.headers;
    const { permissions = [], userId } = verifyToken(authorization);

    let hasPermissions = false;
    for (const permission of requiredPermissions) {
      hasPermissions = permissions.includes(permission);
      if (!hasPermissions) {
        break;
      }
    }

    if (!hasPermissions) {
      return res
        .status(403)
        .json({ message: 'Forbidden: You do not have enough permissions.' });
    }

    req.body.actionUser = userId;

    return next();
  };
