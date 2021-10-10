import { Router } from 'express';

import auth from './auth';
import users from './users';

export default (): Router => {
  const app = Router();

  auth(app);
  users(app);

  return app;
};
