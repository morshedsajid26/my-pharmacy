import express from 'express';
import dashboardRoutes from './dashboard/dashboard.route.js';
import itemRoutes from './item_management/item.route.js';
import saleRoutes from './sale/sale.route.js';
import purchaseRoutes from './purchase/purchase.route.js';
import customerRoutes from './customer/customer.route.js';
import orderRoutes from './order/order.route.js';
import prescriptionRoutes from './prescription/prescription.route.js';
import requestRoutes from './customer_request/request.route.js';
import settingsRoutes from './settings/settings.route.js';

const router = express.Router();

router.use('/dashboard', dashboardRoutes);
router.use('/items', itemRoutes);
router.use('/sales', saleRoutes);
router.use('/purchases', purchaseRoutes);
router.use('/customers', customerRoutes);
router.use('/orders', orderRoutes);
router.use('/prescriptions', prescriptionRoutes);
router.use('/requests', requestRoutes);
router.use('/settings', settingsRoutes);

export default router;
