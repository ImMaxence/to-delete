const express = require('express');
const router = express.Router();
const sensorsController = require('../controllers/sensorsController');

/**
 * @swagger
 * /api/sensors:
 *   post:
 *     summary: "Recevoir et stocker les données des capteurs, puis relayer à Sensor Community."
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: array
 *             items:
 *               type: object
 *               properties:
 *                 name:
 *                   type: string
 *                 value:
 *                   type: number
 *                 unit:
 *                   type: string
 *                 timestamp:
 *                   type: integer
 *     responses:
 *       201:
 *         description: Données enregistrées et relayées.
 *       400:
 *         description: Mauvais format.
 *       500:
 *         description: Erreur serveur.
 */
router.post('/', sensorsController.receiveData);

module.exports = router;
