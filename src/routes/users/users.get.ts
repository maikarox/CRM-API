import { Router } from 'express';
import asyncHandler from 'express-async-handler';

import { getUsers } from '../../controllers/user.controller';
import { isAuthorized } from '../../middleware/authorized';
import { checkScopes } from '../../middleware/checkScopes';

export default (app: Router): void => {
  app.get(
    '/',
    isAuthorized,
    checkScopes('Admin', ['read:all_users']),
    asyncHandler(getUsers),
  );
};
