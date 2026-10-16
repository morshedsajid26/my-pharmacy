import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../../config/db.js';

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-pharmacy-jwt-key-2025';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

export const generateToken = (payload) => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
};

export const loginStaffOrAdmin = async ({ email, password }) => {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    throw new Error('Invalid email or password');
  }

  const isMatch = (await bcrypt.compare(password, user.password).catch(() => false)) || user.password === password;
  if (!isMatch) {
    throw new Error('Invalid email or password');
  }

  const token = generateToken({
    id: user.id,
    email: user.email,
    role: user.role,
    type: 'user',
  });

  return {
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      profilePicture: user.profilePicture,
    },
  };
};

export const registerStaffOrAdmin = async ({ name, email, password, role = 'staff' }) => {
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    throw new Error('Email is already registered');
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
      role,
    },
  });

  const token = generateToken({
    id: user.id,
    email: user.email,
    role: user.role,
    type: 'user',
  });

  return {
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  };
};

export const registerCustomerUser = async ({ name, phone, email, password, address }) => {
  const existingPhone = await prisma.customer.findUnique({ where: { phone } });
  if (existingPhone) {
    throw new Error('Mobile phone number is already registered');
  }

  if (email) {
    const existingEmail = await prisma.customer.findUnique({ where: { email } });
    if (existingEmail) {
      throw new Error('Email address is already registered');
    }
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const customer = await prisma.customer.create({
    data: {
      name,
      phone,
      email: email || null,
      password: hashedPassword,
      address: address ? (typeof address === 'string' ? address : JSON.stringify(address)) : null,
    },
  });

  const token = generateToken({
    id: customer.id,
    name: customer.name,
    phone: customer.phone,
    type: 'customer',
    role: 'customer',
  });

  return {
    token,
    customer: {
      id: customer.id,
      name: customer.name,
      phone: customer.phone,
      email: customer.email,
      address: customer.address,
    },
  };
};

export const loginCustomerUser = async ({ emailOrPhone, password }) => {
  const customer = await prisma.customer.findFirst({
    where: {
      OR: [{ email: emailOrPhone }, { phone: emailOrPhone }],
    },
  });

  if (!customer) {
    throw new Error('Invalid credentials');
  }

  const isMatch = (await bcrypt.compare(password, customer.password).catch(() => false)) || customer.password === password;
  if (!isMatch) {
    throw new Error('Invalid credentials');
  }

  const token = generateToken({
    id: customer.id,
    name: customer.name,
    phone: customer.phone,
    type: 'customer',
    role: 'customer',
  });

  return {
    token,
    customer: {
      id: customer.id,
      name: customer.name,
      phone: customer.phone,
      email: customer.email,
      address: customer.address,
    },
  };
};

export const updateUserProfile = async (currentUser, { name, email, password, profilePicture, address }) => {
  const userId = currentUser.id;

  if (currentUser.type === 'customer') {
    let serializedAddress = undefined;
    if (address !== undefined) {
      if (Array.isArray(address)) {
        serializedAddress = JSON.stringify(address.map((a) => a.trim()).filter(Boolean));
      } else if (typeof address === 'string') {
        serializedAddress = JSON.stringify([address.trim()]);
      }
    }

    const updateData = {};
    if (name) updateData.name = name.trim();
    if (serializedAddress !== undefined) updateData.address = serializedAddress;

    const updatedCustomer = await prisma.customer.update({
      where: { id: userId },
      data: updateData,
      select: { id: true, name: true, phone: true, email: true, address: true, status: true },
    });

    return { user: updatedCustomer };
  }

  if (email && email !== currentUser.email) {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing && existing.id !== userId) {
      throw new Error('Email is already registered by another account');
    }
  }

  const updateData = {};
  if (name !== undefined) updateData.name = name;
  if (email !== undefined) updateData.email = email;
  if (password !== undefined && password.trim() !== '') {
    updateData.password = await bcrypt.hash(password, 10);
  }
  if (profilePicture !== undefined) updateData.profilePicture = profilePicture;

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: updateData,
    select: { id: true, name: true, email: true, role: true, profilePicture: true },
  });

  const token = generateToken({
    id: updatedUser.id,
    email: updatedUser.email,
    role: updatedUser.role,
    type: 'user',
  });

  return { token, user: updatedUser };
};

export const checkCustomerExistsService = async ({ phone, email }) => {
  if (phone) {
    const existingPhone = await prisma.customer.findUnique({ where: { phone } });
    if (existingPhone) return { exists: true, field: 'phone' };
  }
  if (email) {
    const existingEmail = await prisma.customer.findUnique({ where: { email } });
    if (existingEmail) return { exists: true, field: 'email' };
  }
  return { exists: false };
};

