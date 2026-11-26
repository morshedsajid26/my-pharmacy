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
import { protect, requireOwner, requireStaffOrAdmin } from '../../../middlewares/auth.js';

const router = express.Router();

router.use(protect);

// Staff and Owner can view medicines
router.get('/', requireStaffOrAdmin, getOwnerMedicines);
router.get('/low-stock', requireStaffOrAdmin, getLowStockMedicines);
router.get('/:id', requireStaffOrAdmin, getMedicineById);

// Only Owner can add, edit, or delete medicines
router.post('/', requireOwner, validateMedicineInput, addMedicine);
router.put('/:id', requireOwner, updateMedicine);
router.delete('/:id', requireOwner, deleteMedicine);

export default router;
