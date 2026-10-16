export const validatePurchaseInput = (req, res, next) => {
  const { company, items, totalAmount } = req.body;
  if (!company || !items || !Array.isArray(items) || items.length === 0 || totalAmount === undefined) {
    return res.status(400).json({ success: false, message: 'Supplier company, items, and total amount are required' });
  }
  next();
};
