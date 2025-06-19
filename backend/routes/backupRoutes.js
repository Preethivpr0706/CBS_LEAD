// server/routes/backupRoutes.js
const express = require('express');
const backupController = require('../controllers/backupController');

const router = express.Router();

// Create a backup
router.post('/', backupController.createBackup);

// Get list of backups
router.get('/', backupController.getBackups);

// Download a backup
router.get('/download/:filename', backupController.downloadBackup);

module.exports = router;