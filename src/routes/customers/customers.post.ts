import { Router } from 'express';
import asyncHandler from 'express-async-handler';

import { Permission } from '../../constants/permissions.enum';
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