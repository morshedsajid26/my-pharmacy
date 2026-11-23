import express from 'express';
import {
  getPublicMedicines,
  getPublicMedicineById,
  getPublicMedicineAlternatives,
} from './user-item.controller.js';

const router = express.Router();

// Publicly accessible medicine routes for customers
router.get('/', getPublicMedicines);
router.get('/:id/alternatives', getPublicMedicineAlternatives);
router.get('/:id', getPublicMedicineById);

export default router;
