import * as itemService from './item.service.js';

export const getOwnerMedicines = async (req, res) => {
  try {
    const medicines = await itemService.getOwnerMedicinesService(req.query);
    return res.status(200).json({ success: true, count: medicines.length, data: medicines });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getLowStockMedicines = async (req, res) => {
  try {
    const lowStock = await itemService.getLowStockMedicinesService();
    return res.status(200).json({ success: true, count: lowStock.length, data: lowStock });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getMedicineById = async (req, res) => {
  try {
    const medicine = await itemService.getMedicineByIdService(req.params.id);
    return res.status(200).json({ success: true, data: medicine });
  } catch (error) {
    return res.status(404).json({ success: false, message: error.message });
  }
};

export const addMedicine = async (req, res) => {
  try {
    const medicine = await itemService.addMedicineService(req.body);
    return res.status(201).json({ success: true, data: medicine });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const updateMedicine = async (req, res) => {
  try {
    const medicine = await itemService.updateMedicineService(req.params.id, req.body);
    return res.status(200).json({ success: true, data: medicine });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteMedicine = async (req, res) => {
  try {
    await itemService.deleteMedicineService(req.params.id);
    return res.status(200).json({ success: true, message: 'Medicine deleted successfully' });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};
