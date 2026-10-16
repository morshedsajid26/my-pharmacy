import * as prescriptionService from './user-prescription.service.js';

export const createPrescriptionOrder = async (req, res) => {
  try {
    const { prescriptionFile, durationDays, notes } = req.body;
    if (!prescriptionFile) {
      return res.status(400).json({ success: false, message: 'Prescription image/file is required' });
    }

    const order = await prescriptionService.createPrescriptionOrderService(req.user.id, {
      prescriptionFile,
      durationDays,
      notes,
    });

    return res.status(201).json({ success: true, message: 'Prescription uploaded successfully', data: order });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getMyPrescriptions = async (req, res) => {
  try {
    const orders = await prescriptionService.getMyPrescriptionsService(req.user.id);
    return res.status(200).json({ success: true, count: orders.length, data: orders });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const deletePrescriptionOrder = async (req, res) => {
  try {
    await prescriptionService.deleteMyPrescriptionOrderService(req.user.id, req.params.id);
    return res.status(200).json({ success: true, message: 'Prescription deleted successfully' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
