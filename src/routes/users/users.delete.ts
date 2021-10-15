import { Router } from 'express';
import asyncHandler from 'express-async-handler';

import { deleteUser } from '../../controllers/User.controller';
import { isAuthorized } from '../../middleware/authorized';
import { checkScopes } from '../../middleware/checkScopes';

export default (app: Router): void => {
  app.delete(
    '/:userId',
    isAuthorized,
    checkScopes(['delete:all_users']),
    asyncHandler(deleteUser),
  );
};
