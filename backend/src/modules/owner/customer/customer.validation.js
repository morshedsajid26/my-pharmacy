export const validateCustomerInput = (req, res, next) => {
  const { name, phone } = req.body;
  if (!name || !phone) {
    return res.status(400).json({ success: false, message: 'Customer name and phone number are required' });
  }
  next();
};

export const validatePayDueInput = (req, res, next) => {
  const { amount } = req.body;
  if (!amount || isNaN(amount) || parseFloat(amount) <= 0) {
    return res.status(400).json({ success: false, message: 'Valid payment amount is required' });
  }
  next();
};
