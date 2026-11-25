import express from 'express';
import { getAllStaff, createStaff, updateStaff, deleteStaff } from './staff.controller.js';
import { protect, requireOwner } from '../../../middlewares/auth.js';

const router = express.Router();

router.use(protect, requireOwner);

router.get('/', getAllStaff);
router.post('/', createStaff);
router.put('/:id', updateStaff);
router.delete('/:id', deleteStaff);

export default router;
