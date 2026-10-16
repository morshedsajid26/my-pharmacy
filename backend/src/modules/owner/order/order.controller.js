import * as orderService from './order.service.js';

export const getAllOrdersAdmin = async (req, res) => {
  try {
    const orders = await orderService.getAllOrdersAdminService(req.query.status);
    return res.status(200).json({ success: true, count: orders.length, data: orders });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getPendingOrdersCount = async (req, res) => {
  try {
    const count = await orderService.getPendingOrdersCountService();
    return res.status(200).json({ success: true, count });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const approveOnlineOrder = async (req, res) => {
  try {
    const result = await orderService.approveOnlineOrderService(req.params.id);
    return res.status(200).json({ success: true, message: 'Order approved successfully', data: result });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const rejectOnlineOrder = async (req, res) => {
  try {
    const result = await orderService.rejectOnlineOrderService(req.params.id);
    return res.status(200).json({ success: true, message: 'Order rejected', data: result });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
