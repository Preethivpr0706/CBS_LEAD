// routes/followUpRoutes.js
const express = require('express');
const followUpController = require('../controllers/followUpController');

const router = express.Router();

router.get('/client/:clientId', followUpController.getClientFollowUps);
router.post('/client/:clientId', followUpController.createFollowUp);

module.exports = router;