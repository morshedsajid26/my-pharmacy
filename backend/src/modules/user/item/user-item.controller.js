import * as itemService from './user-item.service.js';

export const getPublicMedicines = async (req, res) => {
  try {
    const medicines = await itemService.getPublicMedicinesService(req.query);
    return res.status(200).json({ success: true, count: medicines.length, data: medicines });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getPublicMedicineById = async (req, res) => {
  try {
    const medicine = await itemService.getPublicMedicineByIdService(req.params.id);
    return res.status(200).json({ success: true, data: medicine });
  } catch (error) {
    return res.status(404).json({ success: false, message: error.message });
  }
};
