import express from 'express';
import {
  getDashboardSummary,
  getChartData,
  getDailyLedger,
  getTopSelling,
  getTopProfitable,
  getExpiring,
  getUnsold,
  getLedgerYears,
} from './dashboard.controller.js';
import { protect, requireStaffOrAdmin } from '../../../middlewares/auth.js';

const router = express.Router();

router.use(protect, requireStaffOrAdmin);

router.get('/summary', getDashboardSummary);
router.get('/charts', getChartData);
router.get('/analytics', getChartData);
router.get('/ledger', getDailyLedger);
router.get('/daily-ledger', getDailyLedger);
router.get('/top-selling', getTopSelling);
router.get('/top-profitable', getTopProfitable);
router.get('/expiring', getExpiring);
router.get('/unsold', getUnsold);
router.get('/ledger-years', getLedgerYears);

export default router;

