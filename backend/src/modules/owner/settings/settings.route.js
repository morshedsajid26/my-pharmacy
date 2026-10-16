import express from 'express';
import { getOwnerSettings, updateOwnerSettings } from './settings.controller.js';
import { protect, requireStaffOrAdmin } from '../../../middlewares/auth.js';

const router = express.Router();

router.use(protect, requireStaffOrAdmin);

router.get('/', getOwnerSettings);
router.put('/', updateOwnerSettings);

export default router;
