import * as settingsService from './settings.service.js';

export const getOwnerSettings = async (req, res) => {
  try {
    const settings = await settingsService.getOwnerSettingsService();
    return res.status(200).json({ success: true, data: settings });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const updateOwnerSettings = async (req, res) => {
  try {
    const settings = await settingsService.updateOwnerSettingsService(req.body);
    return res.status(200).json({ success: true, message: 'Settings updated successfully', data: settings });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
