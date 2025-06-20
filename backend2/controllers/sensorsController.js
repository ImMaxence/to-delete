const { SensorData } = require('../models');
const sensorCommunityService = require('../services/sensorCommunityService');

exports.receiveData = async (req, res) => {
  try {
    const dataArray = req.body;
    if (!Array.isArray(dataArray)) {
      return res.status(400).json({ error: 'Payload must be an array.' });
    }
    // Save all data in Postgres
    const saved = await SensorData.bulkCreate(dataArray);
    // Forward to Sensor Community
    await sensorCommunityService.sendToSensorCommunity(dataArray);
    res.status(201).json({ message: 'Data saved and forwarded.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error.' });
  }
};
