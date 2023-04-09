import { Router } from 'express';
import asyncHandler from 'express-async-handler';

import { Permission } from '../../constants/permissions.enum';
import { deleteUser } from '../../controllers/User.controller';
import { isAuthorized } from '../../middleware/authorized';
import { checkScopes } from '../../middleware/checkScopes';

export default (app: Router): void => {
  app.delete(
    '/:userId',
    isAuthorized,
    checkScopes([Permission.DeleteUser]),
    asyncHandler(deleteUser),
  );
};
