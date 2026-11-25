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
    const result = await orderService.acceptOnlineOrderService(req.params.id);
    return res.status(200).json({ success: true, message: 'Order accepted successfully', data: result });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

export const packOnlineOrder = async (req, res) => {
  try {
    const result = await orderService.packOnlineOrderService(req.params.id);
    return res.status(200).json({ success: true, message: 'Order marked as packed', data: result });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

export const assignAndShipOrder = async (req, res) => {
  try {
    const { staffId } = req.body || {};
    const result = await orderService.assignStaffAndShipOrderService(req.params.id, staffId);
    return res.status(200).json({
      success: true,
      message: staffId ? 'Order assigned to staff and marked as shipped' : 'Order marked as shipped',
      data: result,
    });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

export const deliverOnlineOrder = async (req, res) => {
  try {
    const result = await orderService.deliverOnlineOrderService(req.params.id, req.user);
    return res.status(200).json({
      success: true,
      message: 'Delivery completed successfully!',
      data: result,
    });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

export const rejectOnlineOrder = async (req, res) => {
  try {
    const result = await orderService.rejectOnlineOrderService(req.params.id);
    return res.status(200).json({ success: true, message: 'Order rejected', data: result });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

export const getMyAssignedOrders = async (req, res) => {
  try {
    const orders = await orderService.getStaffAssignedOrdersService(req.user.id, req.query.status);
    return res.status(200).json({ success: true, count: orders.length, data: orders });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getStaffDashboard = async (req, res) => {
  try {
    const data = await orderService.getStaffDashboardService(req.user.id);
    return res.status(200).json({ success: true, data });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
