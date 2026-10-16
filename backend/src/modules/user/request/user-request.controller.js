import * as requestService from './user-request.service.js';

export const addMedicineRequest = async (req, res) => {
  try {
    const { medicineId } = req.body;
    if (!medicineId) return res.status(400).json({ success: false, message: 'Medicine ID is required' });

    const request = await requestService.addMedicineRequestService(req.user.id, medicineId);
    return res.status(200).json({ success: true, message: 'Restock request added', data: request });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const removeMedicineRequest = async (req, res) => {
  try {
    const { medicineId } = req.params;
    await requestService.removeMedicineRequestService(req.user.id, medicineId);
    return res.status(200).json({ success: true, message: 'Restock request removed' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getCustomerWishlist = async (req, res) => {
  try {
    const wishlist = await requestService.getCustomerWishlistService(req.user.id);
    return res.status(200).json({ success: true, data: wishlist });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
