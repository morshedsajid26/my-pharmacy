import express from 'express';
import { createPrescriptionOrder, getMyPrescriptions, deletePrescriptionOrder } from './user-prescription.controller.js';
import { protect, requireCustomer } from '../../../middlewares/auth.js';

const router = express.Router();

router.use(protect, requireCustomer);

router.post('/', createPrescriptionOrder);
router.get('/', getMyPrescriptions);
router.get('/my-prescriptions', getMyPrescriptions);
router.delete('/:id', deletePrescriptionOrder);

export default router;
