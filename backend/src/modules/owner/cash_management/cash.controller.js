import * as cashService from './cash.service.js';

export const getCashSummary = async (req, res) => {
  try {
    const { timeframe, date, year, month } = req.query;
    const data = await cashService.getCashSummaryService({
      timeframe,
      dateStr: date,
      year,
      month,
    });
    return res.status(200).json({ success: true, data });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const openRegister = async (req, res) => {
  try {
    const { dateStr, openingBalance, note } = req.body;
    const register = await cashService.openRegisterService({
      dateStr,
      openingBalance,
      note,
    });
    return res.status(200).json({ success: true, data: register });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const closeRegister = async (req, res) => {
  try {
    const { dateStr, closingBalance, note } = req.body;
    const register = await cashService.closeRegisterService({
      dateStr,
      closingBalance,
      note,
      closedBy: req.user?.name || 'Owner',
    });
    return res.status(200).json({ success: true, data: register });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const createExpense = async (req, res) => {
  try {
    const expense = await cashService.createExpenseService({
      ...req.body,
      createdBy: req.user?.name || 'Owner',
    });
    return res.status(201).json({ success: true, data: expense });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getExpenses = async (req, res) => {
  try {
    const expenses = await cashService.getExpensesService(req.query);
    return res.status(200).json({ success: true, data: expenses });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteExpense = async (req, res) => {
  try {
    await cashService.deleteExpenseService(req.params.id);
    return res.status(200).json({ success: true, message: 'Expense deleted successfully' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const createCashAdjustment = async (req, res) => {
  try {
    const adj = await cashService.createCashAdjustmentService({
      ...req.body,
      createdBy: req.user?.name || 'Owner',
    });
    return res.status(201).json({ success: true, data: adj });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
