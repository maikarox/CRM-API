import { Router } from 'express';

import createCustomer from './customers.post';
import getCustomers from './customers.get';
import updateCustomer from './customers.patch';
import deleteCustomer from './customers.delete';

const route = Router();

export default (app: Router): void => {
  app.use('/customers', route);

  createCustomer(route);
  getCustomers(route);
  updateCustomer(route);
  deleteCustomer(route);
};
