import * as saleService from './sale.service.js';

export const getSalesHistory = async (req, res) => {
  try {
    const sales = await saleService.getSalesHistoryService();
    return res.status(200).json({ success: true, count: sales.length, data: sales });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const recordSale = async (req, res) => {
  try {
    const sale = await saleService.recordSaleService(req.body);
    return res.status(201).json({ success: true, message: 'Sale recorded successfully', data: sale });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
