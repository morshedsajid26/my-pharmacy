import * as settingsService from './user-settings.service.js';

export const getStorefrontSettings = async (req, res) => {
  try {
    const settings = await settingsService.getPublicStorefrontSettingsService();
    return res.status(200).json({ success: true, data: settings });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
