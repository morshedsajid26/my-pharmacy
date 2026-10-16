export const validateLogin = (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Email and password are required' });
  }
  next();
};

export const validateSignup = (req, res, next) => {
  const { email, password, name } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ success: false, message: 'Name, email, and password are required' });
  }
  if (password.length < 6) {
    return res.status(400).json({ success: false, message: 'Password must be at least 6 characters long' });
  }
  next();
};

export const validateCustomerRegister = (req, res, next) => {
  const { name, phone, password } = req.body;
  if (!name || !phone || !password) {
    return res.status(400).json({ success: false, message: 'Name, phone number, and password are required' });
  }
  next();
};

export const validateCustomerLogin = (req, res, next) => {
  const { emailOrPhone, password } = req.body;
  if (!emailOrPhone || !password) {
    return res.status(400).json({ success: false, message: 'Email/Phone and password are required' });
  }
  next();
};
