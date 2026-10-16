export const validateCreateOrder = (req, res, next) => {
  const { items, deliveryAddress } = req.body;
  if (!deliveryAddress || !deliveryAddress.trim()) {
    return res.status(400).json({ success: false, message: 'Delivery address is required' });
  }
  if (!items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ success: false, message: 'Cart cannot be empty' });
  }
  next();
};
