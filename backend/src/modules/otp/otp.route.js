import express from 'express';
import { sendResetOtp, verifyResetOtp, resetPassword } from './otp.controller.js';
import { validateSendOtp, validateVerifyOtp, validateResetPassword } from './otp.validation.js';

const router = express.Router();

router.post('/forgot-password', validateSendOtp, sendResetOtp);
router.post('/verify-otp', validateVerifyOtp, verifyResetOtp);
router.post('/reset-password', validateResetPassword, resetPassword);

export default router;
