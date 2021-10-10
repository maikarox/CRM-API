import { Router } from 'express';

import getUsers from './users.get';
import createUser from './users.post';
import updateUser from './users.patch';
import deleteUser from './users.delete';

const route = Router();

export default (app: Router): void => {
  app.use('/users', route);

  createUser(route);
  updateUser(route);
  getUsers(route);
  deleteUser(route);
};
