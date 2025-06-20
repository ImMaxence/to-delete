const axios = require('axios');

const SENSOR_COMMUNITY_URL = process.env.SENSOR_COMMUNITY_URL || 'https://api.sensor.community/v1/push-sensor-data/';
const X_SENSOR = process.env.X_SENSOR || 'esp32-XXXXXXXXXXXX';
const PIN_MAPPING = {
  temperature: process.env.X_PIN_TEMP || '3',
  dust: process.env.X_PIN_DUST || '1',
  micro: process.env.X_PIN_MICRO || '13',
  gps: process.env.X_PIN_GPS || '9',
};

function buildPayload(dataArray) {
  // Adapt this function to build Sensor Community payloads as needed
  // Here, we split by sensor type
  const payloads = [];
  for (const data of dataArray) {
    // Example: group by name/type
    payloads.push({
      headers: {
        'X-Sensor': X_SENSOR,
        'X-Pin': PIN_MAPPING[data.name] || '0',
        'Content-Type': 'application/json',
      },
      body: {
        software_version: '0.0.1',
        sensordatavalues: [
          { value_type: data.name, value: String(data.value) },
        ],
      },
    });
  }
  return payloads;
}

exports.sendToSensorCommunity = async (dataArray) => {
  const payloads = buildPayload(dataArray);
  for (const { headers, body } of payloads) {
    try {
      const response = await axios.post(SENSOR_COMMUNITY_URL, body, { headers });
      console.log(`[Sensor Community] OK (${response.status}) :`, response.data);
    } catch (err) {
      if (err.response) {
        console.error(`[Sensor Community] ERREUR (${err.response.status}) :`, err.response.data);
      } else {
        console.error('[Sensor Community] ERREUR :', err.message);
      }
    }
  }
};
