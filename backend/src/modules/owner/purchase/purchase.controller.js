import * as purchaseService from './purchase.service.js';

export const getPurchases = async (req, res) => {
  try {
    const purchases = await purchaseService.getPurchasesService();
    return res.status(200).json({ success: true, count: purchases.length, data: purchases });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const recordPurchase = async (req, res) => {
  try {
    const purchase = await purchaseService.recordPurchaseService(req.body);
    return res.status(201).json({ success: true, message: 'Purchase recorded', data: purchase });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const updatePurchase = async (req, res) => {
  try {
    const purchase = await purchaseService.updatePurchaseService(req.params.id, req.body);
    return res.status(200).json({ success: true, message: 'Purchase updated', data: purchase });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const deletePurchase = async (req, res) => {
  try {
    await purchaseService.deletePurchaseService(req.params.id);
    return res.status(200).json({ success: true, message: 'Purchase deleted' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
