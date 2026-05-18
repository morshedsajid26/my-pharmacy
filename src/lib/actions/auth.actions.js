'use server';

import prisma from "@/lib/prisma";
import { cookies } from "next/headers";
import { encrypt, decrypt } from "@/lib/session";
import { sendOtpEmail } from "@/lib/mailer";

export async function loginAction(email, password) {
  try {
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user || user.password !== password) { // In a real app, use bcrypt to compare
      throw new Error("Invalid credentials");
    }

    const session = await encrypt({ id: user.id, email: user.email, role: user.role });
    const expires = new Date(Date.now() + 2 * 60 * 60 * 1000);
    
    (await cookies()).set("session", session, { expires, httpOnly: true });

    return { success: true, user: { id: user.id, name: user.name, email: user.email, role: user.role } };
  } catch (error) {
    throw new Error(error.message || "Login failed");
  }
}

export async function signupAction(name, email, password, role) {
  try {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) throw new Error("Email already registered");

    const user = await prisma.user.create({
      data: { name, email, password, role }
    });

    return { success: true };
  } catch (error) {
    throw new Error(error.message || "Signup failed");
  }
}

export async function logoutAction() {
  (await cookies()).set("session", "", { expires: new Date(0) });
  return { success: true };
}

export async function getSession() {
  const session = (await cookies()).get("session")?.value;
  if (!session) return null;
  return await decrypt(session);
}

export async function getCurrentUser() {
  try {
    const session = await getSession();
    if (!session || !session.id) return null;
    
    const user = await prisma.user.findUnique({
      where: { id: session.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        profilePicture: true,
        password: true, // We load password to pre-populate the password field for editing
      }
    });
    return user;
  } catch (error) {
    console.error("Error in getCurrentUser:", error);
    return null;
  }
}

export async function updateUserAction(data) {
  try {
    const session = await getSession();
    if (!session || !session.id) {
      throw new Error("Unauthorized");
    }

    const { name, email, password, profilePicture } = data;

    // Check if email is already taken by another user
    if (email && email !== session.email) {
      const existing = await prisma.user.findUnique({
        where: { email }
      });
      if (existing && existing.id !== session.id) {
        throw new Error("Email is already registered by another user");
      }
    }

    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (email !== undefined) updateData.email = email;
    if (password !== undefined) updateData.password = password;
    if (profilePicture !== undefined) updateData.profilePicture = profilePicture;

    const updatedUser = await prisma.user.update({
      where: { id: session.id },
      data: updateData
    });

    // Re-encrypt session cookie to keep active session synchronized with name and email updates
    const newSession = await encrypt({ id: updatedUser.id, email: updatedUser.email, role: updatedUser.role });
    const expires = new Date(Date.now() + 2 * 60 * 60 * 1000);
    (await cookies()).set("session", newSession, { expires, httpOnly: true });

    return {
      success: true,
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        profilePicture: updatedUser.profilePicture
      }
    };
  } catch (error) {
    console.error("Error in updateUserAction:", error);
    throw new Error(error.message || "Failed to update profile settings");
  }
}

export async function sendResetOtpAction(email) {
  try {
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      throw new Error("No user found with this email address");
    }

    // Generate a secure 6-digit OTP code
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now

    // Save to the database
    await prisma.user.update({
      where: { email },
      data: {
        resetOtp: otp,
        resetOtpExpiresAt: expiresAt
      }
    });

    // Send actual SMTP email containing the OTP
    await sendOtpEmail(email, otp);

    return { success: true };
  } catch (error) {
    throw new Error(error.message || "Failed to send reset OTP");
  }
}

export async function verifyResetOtpAction(email, otp) {
  try {
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      throw new Error("User not found");
    }

    if (!user.resetOtp || user.resetOtp !== otp) {
      throw new Error("Invalid verification code");
    }

    if (user.resetOtpExpiresAt && user.resetOtpExpiresAt < new Date()) {
      throw new Error("Verification code has expired");
    }

    // OTP is valid! Generate a secure one-time reset token
    const resetToken = Math.random().toString(36).substring(2) + Math.random().toString(36).substring(2);
    const tokenExpiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes from now

    // Save token and clear OTP so it can't be reused
    await prisma.user.update({
      where: { email },
      data: {
        resetToken,
        resetTokenExpiresAt: tokenExpiresAt,
        resetOtp: null,
        resetOtpExpiresAt: null
      }
    });

    return { success: true, resetToken };
  } catch (error) {
    throw new Error(error.message || "OTP verification failed");
  }
}

export async function resetPasswordAction(email, token, newPassword) {
  try {
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      throw new Error("User not found");
    }

    if (!user.resetToken || user.resetToken !== token) {
      throw new Error("Invalid reset session");
    }

    if (user.resetTokenExpiresAt && user.resetTokenExpiresAt < new Date()) {
      throw new Error("Reset session has expired. Please request a new OTP");
    }

    // Reset password, and clear all reset metadata
    await prisma.user.update({
      where: { email },
      data: {
        password: newPassword,
        resetToken: null,
        resetTokenExpiresAt: null,
        resetOtp: null,
        resetOtpExpiresAt: null
      }
    });

    return { success: true };
  } catch (error) {
    throw new Error(error.message || "Failed to reset password");
  }
}

