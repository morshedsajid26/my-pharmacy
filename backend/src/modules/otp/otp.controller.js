import * as otpService from './otp.service.js';

export const sendResetOtp = async (req, res) => {
  try {
    const result = await otpService.sendResetOtpService(req.body.email);
    return res.status(200).json(result);
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

export const verifyResetOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const result = await otpService.verifyResetOtpService(email, otp);
    return res.status(200).json({ success: true, message: 'OTP verified successfully', ...result });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { email, token, newPassword } = req.body;
    await otpService.resetPasswordService(email, token, newPassword);
    return res.status(200).json({ success: true, message: 'Password has been reset successfully' });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};
