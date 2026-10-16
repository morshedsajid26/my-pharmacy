import express from 'express';
import { getMedicineRequestsAdmin } from './request.controller.js';
import { protect, requireStaffOrAdmin } from '../../../middlewares/auth.js';

const router = express.Router();

router.use(protect, requireStaffOrAdmin);

router.get('/', getMedicineRequestsAdmin);

export default router;
