import { SystemSetting } from '../models/SystemSetting.js';

export async function getSettings(req, res) {
  try {
    const settingsList = await SystemSetting.find({});
    const settingsMap = {};
    settingsList.forEach((s) => {
      settingsMap[s.key] = s.value;
    });
    return res.json(settingsMap);
  } catch (error) {
    console.error('getSettings error:', error);
    return res.status(500).json({ error: error.message });
  }
}

export async function updateSetting(req, res) {
  try {
    const { key, value } = req.body;
    if (!key) {
      return res.status(400).json({ error: 'Setting key is required' });
    }

    const setting = await SystemSetting.findOneAndUpdate(
      { key },
      { $set: { value: String(value), updated_at: new Date() } },
      { new: true, upsert: true }
    );

    return res.json(setting);
  } catch (error) {
    console.error('updateSetting error:', error);
    return res.status(500).json({ error: error.message });
  }
}
