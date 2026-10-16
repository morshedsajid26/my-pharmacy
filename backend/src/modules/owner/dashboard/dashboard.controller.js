import * as dashboardService from './dashboard.service.js';

export const getDashboardSummary = async (req, res) => {
  try {
    const data = await dashboardService.getDashboardSummaryService();
    return res.status(200).json({ success: true, data });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getChartData = async (req, res) => {
  try {
    const data = await dashboardService.getChartDataService(req.query.range);
    return res.status(200).json({ success: true, data });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getDailyLedger = async (req, res) => {
  try {
    const year = parseInt(req.query.year, 10) || new Date().getFullYear();
    const month = parseInt(req.query.month, 10) || new Date().getMonth();
    const data = await dashboardService.getDailyLedgerService(year, month);
    return res.status(200).json({ success: true, data });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
