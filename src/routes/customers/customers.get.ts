import { Router } from 'express';
import asyncHandler from 'express-async-handler';

import { getCustomers } from '../../controllers/Customer.controller';
import { isAuthorized } from '../../middleware/authorized';
import { checkScopes } from '../../middleware/checkScopes';

export default (app: Router): void => {
  app.get(
    '/',
    isAuthorized,
    checkScopes(['read:all_customers'], 'User'),
    asyncHandler(getCustomers),
  );
};
