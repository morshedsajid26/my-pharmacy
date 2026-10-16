import express from 'express';
import {
  addMedicineRequest,
  removeMedicineRequest,
  getCustomerWishlist,
} from './user-request.controller.js';
import { protect, requireCustomer } from '../../../middlewares/auth.js';

const router = express.Router();

router.use(protect, requireCustomer);

router.post('/', addMedicineRequest);
router.delete('/:medicineId', removeMedicineRequest);
router.get('/wishlist', getCustomerWishlist);

export default router;
