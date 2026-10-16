export const validateSaleInput = (req, res, next) => {
  const { items, totalAmount } = req.body;
  if (!items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ success: false, message: 'Sale must include at least one item' });
  }
  if (totalAmount === undefined || isNaN(totalAmount)) {
    return res.status(400).json({ success: false, message: 'Valid total amount is required' });
  }
  next();
};
