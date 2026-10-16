import * as authService from './auth.service.js';

export const loginUser = async (req, res) => {
  try {
    const result = await authService.loginStaffOrAdmin(req.body);
    return res.status(200).json({ success: true, ...result });
  } catch (error) {
    return res.status(401).json({ success: false, message: error.message || 'Login failed' });
  }
};

export const signupUser = async (req, res) => {
  try {
    const result = await authService.registerStaffOrAdmin(req.body);
    return res.status(201).json({ success: true, ...result });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message || 'Signup failed' });
  }
};

export const getProfile = async (req, res) => {
  return res.status(200).json({ success: true, user: req.user });
};

export const updateProfile = async (req, res) => {
  try {
    const result = await authService.updateUserProfile(req.user, req.body);
    return res.status(200).json({ success: true, ...result });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message || 'Update failed' });
  }
};

export const registerCustomer = async (req, res) => {
  try {
    const result = await authService.registerCustomerUser(req.body);
    return res.status(201).json({ success: true, ...result });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message || 'Registration failed' });
  }
};

export const loginCustomer = async (req, res) => {
  try {
    const result = await authService.loginCustomerUser(req.body);
    return res.status(200).json({ success: true, ...result });
  } catch (error) {
    return res.status(401).json({ success: false, message: error.message || 'Login failed' });
  }
};

export const checkCustomer = async (req, res) => {
  try {
    const result = await authService.checkCustomerExistsService(req.body);
    return res.status(200).json({ success: true, ...result });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message || 'Check failed' });
  }
};

