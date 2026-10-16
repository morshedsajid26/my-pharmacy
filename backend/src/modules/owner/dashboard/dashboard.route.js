import express from 'express';
import { getDashboardSummary, getChartData, getDailyLedger } from './dashboard.controller.js';
import { protect, requireStaffOrAdmin } from '../../../middlewares/auth.js';

const router = express.Router();

router.use(protect, requireStaffOrAdmin);

router.get('/summary', getDashboardSummary);
router.get('/charts', getChartData);
router.get('/ledger', getDailyLedger);

export default router;
