import express from 'express';
import {
  getAllOrdersAdmin,
  getPendingOrdersCount,
  approveOnlineOrder,
  rejectOnlineOrder,
} from './order.controller.js';
import { protect, requireStaffOrAdmin } from '../../../middlewares/auth.js';

const router = express.Router();

router.use(protect, requireStaffOrAdmin);

router.get('/', getAllOrdersAdmin);
router.get('/pending-count', getPendingOrdersCount);
router.put('/:id/approve', approveOnlineOrder);
router.put('/:id/reject', rejectOnlineOrder);

export default router;
