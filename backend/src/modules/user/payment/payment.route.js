import express from 'express';
import { handleSuccess, handleFail, handleCancel, handleIpn } from './payment.controller.js';

const router = express.Router();

router.post('/success', handleSuccess);
router.post('/fail', handleFail);
router.post('/cancel', handleCancel);
router.post('/ipn', handleIpn);

export default router;
