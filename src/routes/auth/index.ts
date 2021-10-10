import { Router } from 'express';
import asyncHandler from 'express-async-handler';

import { login } from '../../controllers/Auth.controller';

export default (app: Router): void => {
  app.post('/login', asyncHandler(login));
};
