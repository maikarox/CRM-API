import { Router } from 'express';
import asyncHandler from 'express-async-handler';

import {
  updateUser,
  disableUser,
  grantUserAdminRole,
  revokeUserAdminRole,
} from '../../controllers/User.controller';
import { isAuthorized } from '../../middleware/authorized';
import { checkScopes } from '../../middleware/checkScopes';

export default (app: Router): void => {
  app.patch(
    '/:userId',
    isAuthorized,
    checkScopes(['update:all_users']),
    asyncHandler(updateUser),
  );

  app.patch(
    '/:userId/disable',
    isAuthorized,
    checkScopes(['update:all_users']),
    asyncHandler(disableUser),
  );

  app.patch(
    '/:userId/grant/admin',
    isAuthorized,
    checkScopes(['update:all_admins']),
    asyncHandler(grantUserAdminRole),
  );

  app.patch(
    '/:userId/revoke/admin',
    isAuthorized,
    checkScopes(['update:all_admins']),
    asyncHandler(revokeUserAdminRole),
  );
};
