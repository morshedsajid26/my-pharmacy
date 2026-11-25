import express from 'express';
import {
  getAllOrdersAdmin,
  getPendingOrdersCount,
  approveOnlineOrder,
  packOnlineOrder,
  assignAndShipOrder,
  deliverOnlineOrder,
  rejectOnlineOrder,
  getMyAssignedOrders,
  getStaffDashboard,
} from './order.controller.js';
import { protect, requireOwner, requireStaffOrAdmin } from '../../../middlewares/auth.js';

const router = express.Router();

router.use(protect);

// Staff & Owner accessible routes (for staff dashboard, assigned orders, and delivery completion)
router.get('/my-assigned', requireStaffOrAdmin, getMyAssignedOrders);
router.get('/staff-dashboard', requireStaffOrAdmin, getStaffDashboard);
router.put('/:id/deliver', requireStaffOrAdmin, deliverOnlineOrder);
router.patch('/:id/deliver', requireStaffOrAdmin, deliverOnlineOrder);

// Owner-only order management controls
router.get('/', requireOwner, getAllOrdersAdmin);
router.get('/pending-count', requireOwner, getPendingOrdersCount);

router.put('/:id/approve', requireOwner, approveOnlineOrder);
router.patch('/:id/approve', requireOwner, approveOnlineOrder);
router.put('/:id/accept', requireOwner, approveOnlineOrder);
router.patch('/:id/accept', requireOwner, approveOnlineOrder);

router.put('/:id/pack', requireOwner, packOnlineOrder);
router.patch('/:id/pack', requireOwner, packOnlineOrder);

router.put('/:id/assign', requireOwner, assignAndShipOrder);
router.patch('/:id/assign', requireOwner, assignAndShipOrder);
router.put('/:id/ship', requireOwner, assignAndShipOrder);
router.patch('/:id/ship', requireOwner, assignAndShipOrder);

router.put('/:id/reject', requireOwner, rejectOnlineOrder);
router.patch('/:id/reject', requireOwner, rejectOnlineOrder);

export default router;
