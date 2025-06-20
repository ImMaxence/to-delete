const axios = require('axios');

const SENSOR_COMMUNITY_URL = process.env.SENSOR_COMMUNITY_URL
const X_SENSOR = process.env.X_SENSOR
const PIN_MAPPING = {
  // SDS011
  P1: '1', // PM10
  P2: '1', // PM2.5
  // BME280
  temperature_bme280: '11',
  humidity_bme280: '11',
  pressure_bme280: '11',
  // DS18B20
  temperature_ds18b20: '13',
  // DNMS (Laerm)
  noise: '15',
  // BMP280
  temperature_bmp280: '3',
  pressure_bmp280: '3',
  // DHT22
  temperature_dht22: '7',
  humidity_dht22: '7',
  // GPS-NEO-6M
  latitude: '9',
  longitude: '9',
  altitude: '9',
};

// Fonction utilitaire pour choisir le bon pin selon le type de donnée et le capteur
function getPinForData(data) {
  // On peut enrichir le data envoyé par le capteur avec un champ "sensor" si besoin
  // Sinon, on fait un mapping par défaut selon le type de donnée
  switch (data.name) {
    case 'P1':
    case 'P2':
      return PIN_MAPPING[data.name];
    case 'humidity':
      // Par défaut BME280, sinon DHT22
      return PIN_MAPPING['humidity_bme280'] || PIN_MAPPING['humidity_dht22'];
    case 'pressure':
      // Par défaut BME280, sinon BMP280
      return PIN_MAPPING['pressure_bme280'] || PIN_MAPPING['pressure_bmp280'];
    case 'temperature':
      // On priorise BME280, puis DS18B20, puis BMP280, puis DHT22
      return PIN_MAPPING['temperature_bme280'] || PIN_MAPPING['temperature_ds18b20'] || PIN_MAPPING['temperature_bmp280'] || PIN_MAPPING['temperature_dht22'];
    case 'noise':
      return PIN_MAPPING['noise_LAeq'];
    case 'latitude':
    case 'longitude':
    case 'altitude':
      return PIN_MAPPING[data.name];
    default:
      return '0';
  }
}


function buildPayload(dataArray) {
  // Adapt this function to build Sensor Community payloads as needed
  // Here, we split by sensor type
  const payloads = [];
  for (const data of dataArray) {
    // Example: group by name/type
    payloads.push({
      headers: {
        'X-Sensor': X_SENSOR,
        'X-Pin': getPinForData(data),
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
