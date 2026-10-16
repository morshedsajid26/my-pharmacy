import express from 'express';
import { getOwnerSettings, updateOwnerSettings } from './settings.controller.js';
import { protect, requireStaffOrAdmin } from '../../../middlewares/auth.js';

const router = express.Router();

// Public storefront settings (for delivery charge, free delivery threshold, etc.)
router.get('/storefront', getOwnerSettings);

router.use(protect, requireStaffOrAdmin);

router.get('/', getOwnerSettings);
router.put('/', updateOwnerSettings);

export default router;
