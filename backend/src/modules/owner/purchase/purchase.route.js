import express from 'express';
import { getPurchases, recordPurchase, updatePurchase, deletePurchase } from './purchase.controller.js';
import { validatePurchaseInput } from './purchase.validation.js';
import { protect, requireOwner } from '../../../middlewares/auth.js';

const router = express.Router();

router.use(protect, requireOwner);

router.get('/', getPurchases);
router.post('/', validatePurchaseInput, recordPurchase);
router.put('/:id', updatePurchase);
router.delete('/:id', deletePurchase);

export default router;
