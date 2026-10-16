import express from 'express';
import { getPublicMedicines, getPublicMedicineById } from './user-item.controller.js';

const router = express.Router();

// Publicly accessible medicine routes for customers
router.get('/', getPublicMedicines);
router.get('/:id', getPublicMedicineById);

export default router;
