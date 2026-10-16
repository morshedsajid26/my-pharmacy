import express from 'express';
import { createPrescriptionOrder, getMyPrescriptions } from './user-prescription.controller.js';
import { protect, requireCustomer } from '../../../middlewares/auth.js';

const router = express.Router();

router.use(protect, requireCustomer);

router.post('/', createPrescriptionOrder);
router.get('/my-prescriptions', getMyPrescriptions);

export default router;
