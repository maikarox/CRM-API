import { Router } from 'express';
import asyncHandler from 'express-async-handler';

import { Permission } from '../../config/permissions';
import { createCustomer } from '../../controllers/Customer.controller';
import { isAuthorized } from '../../middleware/authorized';
import { checkScopes } from '../../middleware/checkScopes';

export default (app: Router): void => {
  app.post(
    '/',
    isAuthorized,
    checkScopes([Permission.CreateCustomer]),
    asyncHandler(createCustomer),
  );
};