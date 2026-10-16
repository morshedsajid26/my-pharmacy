import express from 'express';
import { getPurchases, recordPurchase, updatePurchase, deletePurchase } from './purchase.controller.js';
import { validatePurchaseInput } from './purchase.validation.js';
import { protect, requireStaffOrAdmin } from '../../../middlewares/auth.js';

const router = express.Router();

router.use(protect, requireStaffOrAdmin);

router.get('/', getPurchases);
router.post('/', validatePurchaseInput, recordPurchase);
router.put('/:id', updatePurchase);
router.delete('/:id', deletePurchase);

export default router;
