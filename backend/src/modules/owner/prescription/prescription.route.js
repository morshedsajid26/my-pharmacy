import express from 'express';
import {
  getAllPrescriptionsAdmin,
  updatePrescriptionStatus,
  deletePrescription,
} from './prescription.controller.js';
import { protect, requireStaffOrAdmin } from '../../../middlewares/auth.js';

const router = express.Router();

router.use(protect, requireStaffOrAdmin);

router.get('/', getAllPrescriptionsAdmin);
router.put('/:id/status', updatePrescriptionStatus);
router.delete('/:id', deletePrescription);

export default router;
