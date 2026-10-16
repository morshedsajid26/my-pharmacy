import * as requestService from './request.service.js';

export const getMedicineRequestsAdmin = async (req, res) => {
  try {
    const requests = await requestService.getMedicineRequestsAdminService();
    return res.status(200).json({ success: true, count: requests.length, data: requests });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
