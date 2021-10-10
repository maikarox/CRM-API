import { Router } from 'express';
import asyncHandler from 'express-async-handler';

import {
  updateUser,
  disableUser,
  grantUserAdminRole,
  revokeUserAdminRole,
} from '../../controllers/user.controller';
import { isAuthorized } from '../../middleware/authorized';
import { checkScopes } from '../../middleware/checkScopes';

export default (app: Router): void => {
  app.patch(
    '/:userId',
    isAuthorized,
    checkScopes('Admin', ['update:all_users']),
    asyncHandler(updateUser),
  );

  app.patch(
    '/:userId/disable',
    isAuthorized,
    checkScopes('Admin', ['update:all_users']),
    asyncHandler(disableUser),
  );

  app.patch(
    '/:userId/grant/admin',
    isAuthorized,
    checkScopes('Admin', ['update:all_roles']),
    asyncHandler(grantUserAdminRole),
  );

  app.patch(
    '/:userId/revoke/admin',
    isAuthorized,
    checkScopes('Admin', ['update:all_roles']),
    asyncHandler(revokeUserAdminRole),
  );
};
