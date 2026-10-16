import jwt from 'jsonwebtoken';
import prisma from '../config/db.js';

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-pharmacy-jwt-key-2025';

export const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies && (req.cookies.token || req.cookies.session || req.cookies.customer_session)) {
    token = req.cookies.token || req.cookies.session || req.cookies.customer_session;
  }

  if (!token) {
    return res.status(401).json({ success: false, message: 'Not authorized, no token provided' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);

    if (decoded.type === 'customer') {
      const customer = await prisma.customer.findUnique({
        where: { id: decoded.id },
        select: { id: true, name: true, phone: true, email: true, address: true, status: true }
      });
      if (!customer) {
        return res.status(401).json({ success: false, message: 'Customer account not found' });
      }
      req.user = { ...customer, type: 'customer', role: 'customer' };
    } else {
      const user = await prisma.user.findUnique({
        where: { id: decoded.id },
        select: { id: true, name: true, email: true, role: true, profilePicture: true }
      });
      if (!user) {
        return res.status(401).json({ success: false, message: 'User account not found' });
      }
      req.user = { ...user, type: 'user' };
    }

    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Not authorized, token invalid or expired' });
  }
};

export const requireAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ success: false, message: 'Access denied: Admin role required' });
  }
};

export const requireStaffOrAdmin = (req, res, next) => {
  if (req.user && (req.user.role === 'admin' || req.user.role === 'staff')) {
    next();
  } else {
    res.status(403).json({ success: false, message: 'Access denied: Admin or Staff role required' });
  }
};

export const requireCustomer = (req, res, next) => {
  if (req.user && req.user.type === 'customer') {
    next();
  } else {
    res.status(403).json({ success: false, message: 'Access denied: Customer authentication required' });
  }
};

export const optionalAuth = async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next();
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    if (decoded.type === 'customer') {
      const customer = await prisma.customer.findUnique({
        where: { id: decoded.id },
        select: { id: true, name: true, phone: true, email: true, address: true, status: true }
      });
      if (customer) req.user = { ...customer, type: 'customer', role: 'customer' };
    } else {
      const user = await prisma.user.findUnique({
        where: { id: decoded.id },
        select: { id: true, name: true, email: true, role: true, profilePicture: true }
      });
      if (user) req.user = { ...user, type: 'user' };
    }
  } catch (err) {
    // Ignore invalid token in optional auth
  }

  next();
};
