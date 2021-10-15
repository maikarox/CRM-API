import { Router } from 'express';
import asyncHandler from 'express-async-handler';

import { registerUser } from '../../controllers/User.controller';
import { isAuthorized } from '../../middleware/authorized';
import { checkScopes } from '../../middleware/checkScopes';

export default (app: Router): void => {
  app.post(
    '/',
    isAuthorized,
    checkScopes(['create:all_users']),
    asyncHandler(registerUser),
  );
};
