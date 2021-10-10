import { RequestHandler } from 'express';

import { verifyToken } from '../helpers/decodeToken';

export const checkScopes =
  (requiredRole: string, requiredPermissions: string[]): RequestHandler =>
  (req, res, next) => {
    const { authorization } = req.headers;
    const { roles = '', permissions = [], userId } = verifyToken(authorization);

    const hasRole = roles.includes(requiredRole);

    let hasPermissions = false;
    for (const permission of requiredPermissions) {
      hasPermissions = permissions.includes(permission);
      if (!hasPermissions) {
        break;
      }
    }

    if (!hasRole || !hasPermissions) {
      return res
        .status(403)
        .json({ message: 'Forbidden: You do not have enough permissions.' });
    }

    req.body.actionUser = userId;

    return next();
  };
