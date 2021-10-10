import { Router } from 'express';
import asyncHandler from 'express-async-handler';

import { registerUser } from '../../controllers/user.controller';
import { isAuthorized } from '../../middleware/authorized';
import { checkScopes } from '../../middleware/checkScopes';

export default (app: Router): void => {
  app.post(
    '/',
    isAuthorized,
    checkScopes('Admin', ['create:all_users']),
    asyncHandler(registerUser),
  );
};
