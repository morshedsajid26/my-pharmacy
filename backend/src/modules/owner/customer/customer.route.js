import express from 'express';
import {
  getCustomers,
  getCustomerById,
  createCustomer,
  updateCustomer,
  payCustomerDue,
} from './customer.controller.js';
import { validateCustomerInput, validatePayDueInput } from './customer.validation.js';
import { protect, requireStaffOrAdmin } from '../../../middlewares/auth.js';

const router = express.Router();

router.use(protect, requireStaffOrAdmin);

router.get('/', getCustomers);
router.get('/:id', getCustomerById);
router.post('/', validateCustomerInput, createCustomer);
router.put('/:id', updateCustomer);
router.post('/:id/pay-due', validatePayDueInput, payCustomerDue);

export default router;
