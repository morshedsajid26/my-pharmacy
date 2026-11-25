import express from 'express';
import {
  getCashSummary,
  openRegister,
  closeRegister,
  createExpense,
  getExpenses,
  deleteExpense,
  createCashAdjustment,
} from './cash.controller.js';
import { protect, requireOwner } from '../../../middlewares/auth.js';

const router = express.Router();

// Require authenticated owner for all cash drawer and financial ledger operations
router.use(protect, requireOwner);

router.get('/summary', getCashSummary);
router.post('/register/open', openRegister);
router.post('/register/close', closeRegister);

router.get('/expenses', getExpenses);
router.post('/expenses', createExpense);
router.delete('/expenses/:id', deleteExpense);

router.post('/adjustments', createCashAdjustment);

export default router;
