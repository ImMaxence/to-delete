const { SensorData } = require('../models');
const sensorCommunityService = require('../services/sensorCommunityService');

exports.receiveData = async (req, res) => {
  try {
    const dataArray = req.body;
    if (!Array.isArray(dataArray)) {
      return res.status(400).json({ error: 'Payload must be an array.' });
    }
    // 1. Envoyer à Sensor Community d'abord
    const sent = await sensorCommunityService.sendToSensorCommunity(dataArray);
    if (!sent) {
      console.error('[API] Données NON envoyées à Sensor Community, rien sauvegardé en base.');
      return res.status(502).json({ error: 'Data not sent to Sensor Community, nothing saved.' });
    }
    // 2. Sauvegarder en base seulement si succès
    const saved = await SensorData.bulkCreate(dataArray);
    console.log('[API] Données envoyées à Sensor Community ET sauvegardées en base.');
    res.status(201).json({ message: 'Data saved and forwarded.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error.' });
  }
};
