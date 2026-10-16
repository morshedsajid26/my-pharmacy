import express from 'express';
import {
  loginUser,
  signupUser,
  getProfile,
  updateProfile,
  registerCustomer,
  loginCustomer,
  checkCustomer,
} from './auth.controller.js';
import {
  validateLogin,
  validateSignup,
  validateCustomerRegister,
  validateCustomerLogin,
} from './auth.validation.js';
import { protect } from '../../middlewares/auth.js';

const router = express.Router();

// Staff / Owner Auth
router.post('/login', validateLogin, loginUser);
router.post('/signup', validateSignup, signupUser);
router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);

// Customer / Storefront Auth
router.post('/customer/check', checkCustomer);
router.post('/customer/register', validateCustomerRegister, registerCustomer);
router.post('/customer/login', validateCustomerLogin, loginCustomer);


export default router;
