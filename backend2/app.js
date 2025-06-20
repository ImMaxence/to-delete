require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const { sequelize } = require('./models');
const sensorsRoutes = require('./routes/sensors');
const setupSwagger = require('./swagger');

const app = express();
app.use(bodyParser.json());
setupSwagger(app);
app.use('/api/sensors', sensorsRoutes);

const PORT = process.env.PORT || 3000;

// Affiche toutes les variables Railway et .env importantes
console.log('--- ENV Railway & .env ---');
const keysToShow = [
  'PORT',
  'DB_HOST', 'DB_PORT', 'DB_NAME', 'DB_USER', 'DB_PASSWORD', 'DB_SSL',
  'DATABASE_URL', 'DATABASE_PUBLIC_URL',
  'PGHOST', 'PGPORT', 'PGDATABASE', 'PGUSER', 'PGPASSWORD',
  'POSTGRES_DB', 'POSTGRES_USER', 'POSTGRES_PASSWORD',
  'SENSOR_COMMUNITY_URL', 'X_SENSOR', 'X_PIN_MICRO', 'X_PIN_DUST', 'X_PIN_TEMP', 'X_PIN_GPS'
];
keysToShow.forEach(k => {
  if(process.env[k]) console.log(`${k} = ${process.env[k]}`);
});
console.log('-------------------------');
console.log('⚠️  L\'URL publique Railway est visible dans le dashboard Railway (onglet Deployments > Domain).');

sequelize.sync().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Swagger docs at http://localhost:${PORT}/api-docs`);
  });
});
