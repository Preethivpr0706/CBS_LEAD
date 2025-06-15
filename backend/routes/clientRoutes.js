// routes/clientRoutes.js
const express = require('express');
const clientController = require('../controllers/clientController');

const router = express.Router();

router.get('/', clientController.getAllClients);
router.get('/:id', clientController.getClientById);
router.post('/', clientController.createClient);
router.put('/:id', clientController.updateClient);
router.patch('/:id/status', clientController.updateClientStatus);
router.delete('/:id', clientController.deleteClient);

module.exports = router;