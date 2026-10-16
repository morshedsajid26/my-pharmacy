import prisma from '../../config/db.js';
import { sendOtpEmail } from '../../config/mailer.js';
import bcrypt from 'bcryptjs';

export const sendResetOtpService = async (email) => {
  let user = await prisma.user.findUnique({ where: { email } });
  let isCustomer = false;

  if (!user) {
    user = await prisma.customer.findUnique({ where: { email } });
    isCustomer = true;
  }

  if (!user) {
    throw new Error('No user or customer found with this email address');
  }

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

  if (isCustomer) {
    await prisma.customer.update({
      where: { email },
      data: { resetOtp: otp, resetOtpExpiresAt: expiresAt },
    });
  } else {
    await prisma.user.update({
      where: { email },
      data: { resetOtp: otp, resetOtpExpiresAt: expiresAt },
    });
  }

  await sendOtpEmail(email, otp);
  return { success: true, message: 'OTP sent to email successfully' };
};

export const verifyResetOtpService = async (email, otp) => {
  let user = await prisma.user.findUnique({ where: { email } });
  let isCustomer = false;

  if (!user) {
    user = await prisma.customer.findUnique({ where: { email } });
    isCustomer = true;
  }

  if (!user) {
    throw new Error('User not found');
  }

  if (!user.resetOtp || user.resetOtp !== String(otp).trim()) {
    throw new Error('Invalid verification OTP code');
  }

  if (user.resetOtpExpiresAt && user.resetOtpExpiresAt < new Date()) {
    throw new Error('Verification OTP code has expired');
  }

  const resetToken = Math.random().toString(36).substring(2) + Math.random().toString(36).substring(2);
  const tokenExpiresAt = new Date(Date.now() + 15 * 60 * 1000);

  const updateData = {
    resetToken,
    resetTokenExpiresAt: tokenExpiresAt,
    resetOtp: null,
    resetOtpExpiresAt: null,
  };

  if (isCustomer) {
    await prisma.customer.update({ where: { email }, data: updateData });
  } else {
    await prisma.user.update({ where: { email }, data: updateData });
  }

  return { resetToken };
};

export const resetPasswordService = async (email, token, newPassword) => {
  let user = await prisma.user.findUnique({ where: { email } });
  let isCustomer = false;

  if (!user) {
    user = await prisma.customer.findUnique({ where: { email } });
    isCustomer = true;
  }

  if (!user) {
    throw new Error('User not found');
  }

  if (!user.resetToken || user.resetToken !== token) {
    throw new Error('Invalid reset token session');
  }

  if (user.resetTokenExpiresAt && user.resetTokenExpiresAt < new Date()) {
    throw new Error('Reset token session has expired');
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);
  const updateData = {
    password: hashedPassword,
    resetToken: null,
    resetTokenExpiresAt: null,
    resetOtp: null,
    resetOtpExpiresAt: null,
  };

  if (isCustomer) {
    await prisma.customer.update({ where: { email }, data: updateData });
  } else {
    await prisma.user.update({ where: { email }, data: updateData });
  }

  return { success: true };
};
