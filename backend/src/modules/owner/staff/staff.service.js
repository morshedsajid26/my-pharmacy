import bcrypt from 'bcryptjs';
import prisma from '../../../config/db.js';

export const getAllStaffService = async () => {
  const staffList = await prisma.user.findMany({
    where: { role: 'staff' },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      role: true,
      profilePicture: true,
      createdAt: true,
      assignedOrders: {
        select: {
          id: true,
          status: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  return staffList.map((s) => {
    const activeDeliveries = s.assignedOrders.filter((o) => o.status === 'SHIPPED').length;
    const completedDeliveries = s.assignedOrders.filter((o) => o.status === 'DELIVERED').length;
    return {
      id: s.id,
      name: s.name,
      email: s.email,
      phone: s.phone,
      role: s.role,
      profilePicture: s.profilePicture,
      createdAt: s.createdAt,
      activeDeliveries,
      completedDeliveries,
      totalAssigned: s.assignedOrders.length,
    };
  });
};

export const createStaffService = async ({ name, email, phone, password }) => {
  const cleanName = String(name || '').trim();
  const cleanEmail = String(email || '').trim().toLowerCase();
  const cleanPhone = phone ? String(phone).trim() : null;

  if (!cleanName || !cleanEmail || !password) {
    throw new Error('Name, email, and password are required');
  }
  if (String(password).length < 6) {
    throw new Error('Password must be at least 6 characters');
  }

  const existingUser = await prisma.user.findFirst({
    where: { email: { equals: cleanEmail, mode: 'insensitive' } },
  });
  if (existingUser) {
    throw new Error('An account with this email already exists');
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  return await prisma.user.create({
    data: {
      name: cleanName,
      email: cleanEmail,
      phone: cleanPhone,
      password: hashedPassword,
      role: 'staff',
    },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      role: true,
      createdAt: true,
    },
  });
};

export const updateStaffService = async (id, { name, email, phone, password }) => {
  const existing = await prisma.user.findUnique({ where: { id } });
  if (!existing || existing.role !== 'staff') {
    throw new Error('Staff account not found');
  }

  const updateData = {};
  if (name !== undefined && String(name).trim()) {
    updateData.name = String(name).trim();
  }
  if (phone !== undefined) {
    updateData.phone = phone ? String(phone).trim() : null;
  }
  if (email !== undefined && String(email).trim()) {
    const cleanEmail = String(email).trim().toLowerCase();
    if (cleanEmail !== existing.email.toLowerCase()) {
      const emailTaken = await prisma.user.findFirst({
        where: {
          email: { equals: cleanEmail, mode: 'insensitive' },
          NOT: { id },
        },
      });
      if (emailTaken) {
        throw new Error('Email is already in use by another account');
      }
      updateData.email = cleanEmail;
    }
  }
  if (password && String(password).trim() !== '') {
    if (String(password).length < 6) {
      throw new Error('Password must be at least 6 characters');
    }
    updateData.password = await bcrypt.hash(password, 10);
  }

  return await prisma.user.update({
    where: { id },
    data: updateData,
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      role: true,
      createdAt: true,
    },
  });
};

export const deleteStaffService = async (id) => {
  const existing = await prisma.user.findUnique({ where: { id } });
  if (!existing || existing.role !== 'staff') {
    throw new Error('Staff account not found');
  }

  await prisma.user.delete({ where: { id } });
  return { deleted: true, id };
};
