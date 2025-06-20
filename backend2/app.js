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

sequelize.sync().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Swagger docs at http://localhost:${PORT}/api-docs`);
  });
});
