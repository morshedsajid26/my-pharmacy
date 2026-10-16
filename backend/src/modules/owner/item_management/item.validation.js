export const validateMedicineInput = (req, res, next) => {
  const { name, company, purchasePrice, sellingPrice } = req.body;
  if (!name || !company || purchasePrice === undefined || sellingPrice === undefined) {
    return res.status(400).json({ success: false, message: 'Name, company, purchasePrice and sellingPrice are required' });
  }
  next();
};
