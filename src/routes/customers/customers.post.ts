import { Router } from 'express';
import asyncHandler from 'express-async-handler';

import { createCustomer } from '../../controllers/Customer.controller';
import { isAuthorized } from '../../middleware/authorized';
import { checkScopes } from '../../middleware/checkScopes';

export default (app: Router): void => {
  app.post(
    '/',
    isAuthorized,
    checkScopes('User', ['create:all_customers']),
    asyncHandler(createCustomer),
  );
};