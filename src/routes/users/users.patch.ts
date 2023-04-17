import { Router } from 'express';
import asyncHandler from 'express-async-handler';

import {
  updateUser,
  disableUser,
  grantUserAdminRole,
  revokeUserAdminRole,
} from '../../controllers/User.controller';
import { Permission } from '../../constants/permissions';
import { isAuthorized } from '../../middleware/authorized';
import { checkScopes } from '../../middleware/checkScopes';

export default (app: Router): void => {
  app.patch(
    '/:userId',
    isAuthorized,
    checkScopes([Permission.UpdateUser]),
    asyncHandler(updateUser),
  );

  app.patch(
    '/:userId/disable',
    isAuthorized,
    checkScopes([Permission.UpdateUser]),
    asyncHandler(disableUser),
  );

  app.patch(
    '/:userId/grant/admin',
    isAuthorized,
    checkScopes([Permission.UpdateAdmin]),
    asyncHandler(grantUserAdminRole),
  );

  app.patch(
    '/:userId/revoke/admin',
    isAuthorized,
    checkScopes([Permission.UpdateAdmin]),
    asyncHandler(revokeUserAdminRole),
  );
};
