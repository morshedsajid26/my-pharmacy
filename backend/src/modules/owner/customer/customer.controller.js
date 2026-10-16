import * as customerService from './customer.service.js';

export const getCustomers = async (req, res) => {
  try {
    const customers = await customerService.getCustomersService();
    return res.status(200).json({ success: true, count: customers.length, data: customers });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getCustomerById = async (req, res) => {
  try {
    const customer = await customerService.getCustomerByIdService(req.params.id);
    return res.status(200).json({ success: true, data: customer });
  } catch (error) {
    return res.status(404).json({ success: false, message: error.message });
  }
};

export const createCustomer = async (req, res) => {
  try {
    const customer = await customerService.createCustomerService(req.body);
    return res.status(201).json({ success: true, data: customer });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

export const updateCustomer = async (req, res) => {
  try {
    const customer = await customerService.updateCustomerService(req.params.id, req.body);
    return res.status(200).json({ success: true, data: customer });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const payCustomerDue = async (req, res) => {
  try {
    const { amount, waiveAmount } = req.body;
    const customer = await customerService.payCustomerDueService(req.params.id, amount, waiveAmount);
    return res.status(200).json({ success: true, message: 'Due payment collected', data: customer });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
