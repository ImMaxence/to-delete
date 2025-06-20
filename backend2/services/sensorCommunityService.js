const axios = require('axios');

const SENSOR_COMMUNITY_URL = process.env.SENSOR_COMMUNITY_URL
const X_SENSOR = process.env.X_SENSOR
const PIN_MAPPING = {
  temperature: process.env.X_PIN_TEMP,
  dust: process.env.X_PIN_DUST,
  micro: process.env.X_PIN_MICRO,
  gps: process.env.X_PIN_GPS,
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
      original: data // Ajout pour log
    });
  }
  return payloads;
}

exports.sendToSensorCommunity = async (dataArray) => {
  const payloads = buildPayload(dataArray);
  console.log('--- [Sensor Community] Envoi des données ---');
  console.log('Payload d\'origine reçu :', JSON.stringify(dataArray, null, 2));
  for (const { headers, body, original } of payloads) {
    console.log('\n[Sensor Community] Préparation d\'un payload pour :', original);
    console.log('[Sensor Community] Headers envoyés :', headers);
    console.log('[Sensor Community] Body envoyé :', JSON.stringify(body, null, 2));
    try {
      const response = await axios.post(SENSOR_COMMUNITY_URL, body, { headers });
      console.log(`[Sensor Community] OK (${response.status}) :`, response.data);
    } catch (err) {
      if (err.response) {
        console.error(`[Sensor Community] ERREUR (${err.response.status}) :`, err.response.data);
        console.error('[Sensor Community] Body problématique :', JSON.stringify(body, null, 2));
      } else {
        console.error('[Sensor Community] ERREUR :', err.message);
      }
      console.log('--- [Sensor Community] Fin de l\'envoi ---');
      return false; // Arrête dès la première erreur
    }
  }
  console.log('--- [Sensor Community] Fin de l\'envoi ---');
  return true;
};
