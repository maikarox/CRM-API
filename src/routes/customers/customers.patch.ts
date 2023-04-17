import { Router } from 'express';
import asyncHandler from 'express-async-handler';

import { Permission } from '../../constants/permissions';
import { updateCustomer, disableCustomer } from '../../controllers/Customer.controller';
import { isAuthorized } from '../../middleware/authorized';
import { checkScopes } from '../../middleware/checkScopes';

export default (app: Router): void => {
  app.patch(
    '/:customerId',
    isAuthorized,
    checkScopes([Permission.UpdateCustomer]),
    asyncHandler(updateCustomer),
  );

  app.patch(
    '/:customerId/disable',
    isAuthorized,
    checkScopes([Permission.UpdateCustomer]),
    asyncHandler(disableCustomer),
  );
};