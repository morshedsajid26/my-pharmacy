import express from 'express';
import itemRoutes from './item/user-item.route.js';
import orderRoutes from './order/user-order.route.js';
import prescriptionRoutes from './prescription/user-prescription.route.js';
import requestRoutes from './request/user-request.route.js';
import aiAssistantRoutes from './ai_assistant/ai-assistant.route.js';
import paymentRoutes from './payment/payment.route.js';
import settingsRoutes from './settings/user-settings.route.js';

const router = express.Router();

router.use('/items', itemRoutes);
router.use('/medicines', itemRoutes);
router.use('/orders', orderRoutes);
router.use('/prescriptions', prescriptionRoutes);
router.use('/requests', requestRoutes);
router.use('/ai-assistant', aiAssistantRoutes);
router.use('/payment', paymentRoutes);
router.use('/settings', settingsRoutes);

export default router;
