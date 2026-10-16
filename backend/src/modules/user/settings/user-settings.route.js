import express from 'express';
import { getStorefrontSettings } from './user-settings.controller.js';

const router = express.Router();

// Public route to fetch delivery charges and discount tiers
router.get('/', getStorefrontSettings);

export default router;
