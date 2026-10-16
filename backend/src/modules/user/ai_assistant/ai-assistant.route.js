import express from 'express';
import { chatWithAI, getChatHistory } from './ai-assistant.controller.js';
import { optionalAuth } from '../../../middlewares/auth.js';

const router = express.Router();

router.post('/', optionalAuth, chatWithAI);
router.get('/history', optionalAuth, getChatHistory);

export default router;
