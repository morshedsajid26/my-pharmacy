import * as prescriptionService from './prescription.service.js';

export const getAllPrescriptionsAdmin = async (req, res) => {
  try {
    const orders = await prescriptionService.getAllPrescriptionsAdminService(req.query.status);
    return res.status(200).json({ success: true, count: orders.length, data: orders });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const updatePrescriptionStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!status) return res.status(400).json({ success: false, message: 'Status is required' });

    const order = await prescriptionService.updatePrescriptionStatusService(req.params.id, status);
    return res.status(200).json({ success: true, message: 'Status updated', data: order });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const deletePrescription = async (req, res) => {
  try {
    await prescriptionService.deletePrescriptionService(req.params.id);
    return res.status(200).json({ success: true, message: 'Prescription deleted' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
