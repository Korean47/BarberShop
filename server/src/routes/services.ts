import { Router } from 'express';
import * as servicesController from '../controllers/servicesController.js';

export const serviceRoutes = Router();

serviceRoutes.get('/', servicesController.getServices);
serviceRoutes.get('/:id', servicesController.getService);
