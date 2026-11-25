import * as staffService from './staff.service.js';

export const getAllStaff = async (req, res) => {
  try {
    const staff = await staffService.getAllStaffService();
    return res.status(200).json({ success: true, count: staff.length, data: staff });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const createStaff = async (req, res) => {
  try {
    const staff = await staffService.createStaffService(req.body);
    return res.status(201).json({ success: true, message: 'Staff account created successfully', data: staff });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

export const updateStaff = async (req, res) => {
  try {
    const staff = await staffService.updateStaffService(req.params.id, req.body);
    return res.status(200).json({ success: true, message: 'Staff account updated successfully', data: staff });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

export const deleteStaff = async (req, res) => {
  try {
    const result = await staffService.deleteStaffService(req.params.id);
    return res.status(200).json({ success: true, message: 'Staff account deleted successfully', data: result });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};
