import express from 'express';
import { getSalesHistory, recordSale } from './sale.controller.js';
import { validateSaleInput } from './sale.validation.js';
import { protect, requireStaffOrAdmin } from '../../../middlewares/auth.js';

const router = express.Router();

router.use(protect, requireStaffOrAdmin);

router.get('/', getSalesHistory);
router.post('/', validateSaleInput, recordSale);

export default router;
