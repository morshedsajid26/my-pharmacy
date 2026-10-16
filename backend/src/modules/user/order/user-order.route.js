import express from 'express';
import {
  createOnlineOrder,
  getMyOrders,
  getCustomerOverviewStats,
} from './user-order.controller.js';
import { validateCreateOrder } from './user-order.validation.js';
import { protect, requireCustomer } from '../../../middlewares/auth.js';

const router = express.Router();

router.use(protect, requireCustomer);

router.post('/', validateCreateOrder, createOnlineOrder);
router.get('/my-orders', getMyOrders);
router.get('/stats', getCustomerOverviewStats);

export default router;
