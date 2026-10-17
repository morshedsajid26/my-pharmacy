import * as orderService from './user-order.service.js';

export const createOnlineOrder = async (req, res) => {
  try {
    const result = await orderService.createOnlineOrderService(req.user, req.body);
    return res.status(201).json({ success: true, message: 'Order placed successfully', ...result });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getMyOrders = async (req, res) => {
  try {
    const orders = await orderService.getCustomerOrdersService(req.user.id);
    return res.status(200).json({ success: true, count: orders.length, data: orders });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getCustomerOverviewStats = async (req, res) => {
  try {
    const stats = await orderService.getCustomerStatsService(req.user.id);
    return res.status(200).json({ success: true, data: stats });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
