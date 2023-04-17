import { Router } from 'express';
import asyncHandler from 'express-async-handler';

import { Permission } from '../../constants/permissions';
import { deleteUser } from '../../controllers/Customer.controller';
import { isAuthorized } from '../../middleware/authorized';
import { checkScopes } from '../../middleware/checkScopes';

export default (app: Router): void => {
  app.delete(
    '/:customerId',
    isAuthorized,
    checkScopes([Permission.DeleteCustomer]),
    asyncHandler(deleteUser),
  );
};
