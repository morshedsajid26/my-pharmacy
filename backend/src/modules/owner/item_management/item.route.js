import express from 'express';
import {
  getOwnerMedicines,
  getLowStockMedicines,
  getMedicineById,
  addMedicine,
  updateMedicine,
  deleteMedicine,
} from './item.controller.js';
import { validateMedicineInput } from './item.validation.js';
import { protect, requireStaffOrAdmin } from '../../../middlewares/auth.js';

const router = express.Router();

router.use(protect, requireStaffOrAdmin);

router.get('/', getOwnerMedicines);
router.get('/low-stock', getLowStockMedicines);
router.get('/:id', getMedicineById);
router.post('/', validateMedicineInput, addMedicine);
router.put('/:id', updateMedicine);
router.delete('/:id', deleteMedicine);

export default router;
