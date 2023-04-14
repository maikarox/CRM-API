import cors from 'cors';
import express, { Application } from 'express';
import helmet from 'helmet';

import routes from '../routes';

export default (app: Application): void => {
  app.use(helmet());
  app.enable('trust proxy');
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));
  app.use('/api', routes());
};
