import express from 'express';
import { sendResetOtp, verifyResetOtp, resetPassword, sendVerificationEmail } from './otp.controller.js';
import { validateSendOtp, validateVerifyOtp, validateResetPassword } from './otp.validation.js';

const router = express.Router();

router.post('/forgot-password', validateSendOtp, sendResetOtp);
router.post('/verify-otp', validateVerifyOtp, verifyResetOtp);
router.post('/reset-password', validateResetPassword, resetPassword);
router.post('/send-verification', sendVerificationEmail);

export default router;

