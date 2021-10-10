import { Router } from 'express';

import auth from './auth';
import customers from './customers';
import users from './users';

export default (): Router => {
  const app = Router();

  auth(app);
  customers(app);
  users(app);

  return app;
};
