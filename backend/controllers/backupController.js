// server/controllers/backupController.js
const backupService = require('../services/backupService');
const path = require('path');
const fs = require('fs').promises;

const backupController = {
    // Create a full backup
    createBackup: async(req, res) => {
        try {
            const backupPath = await backupService.createFullBackup();
            res.json({
                message: 'Backup created successfully',
                backupPath: path.basename(backupPath)
            });
        } catch (error) {
            console.error('Error creating backup:', error);
            res.status(500).json({ error: 'Failed to create backup' });
        }
    },

    // Get list of available backups
    getBackups: async(req, res) => {
        try {
            const backupDir = path.join(__dirname, '..', 'backups');

            // Check if directory exists, create if it doesn't
            try {
                await fs.access(backupDir);
            } catch (error) {
                await fs.mkdir(backupDir, { recursive: true });
                // Return empty array if directory was just created
                return res.json([]);
            }

            const files = await fs.readdir(backupDir);

            // Use Promise.all to get stats for all files asynchronously
            const backupsPromises = files
                .filter(file => file.startsWith('backup_') && file.endsWith('.xlsx') && !file.startsWith('~'))
                .map(async(file) => {
                    try {
                        const filePath = path.join(backupDir, file);
                        const stats = await fs.stat(filePath);
                        return {
                            filename: file,
                            created: stats.birthtime || stats.ctime,
                            size: stats.size
                        };
                    } catch (err) {
                        console.error(`Error getting stats for file ${file}:`, err);
                        return null;
                    }
                });

            const backups = (await Promise.all(backupsPromises))
                .filter(backup => backup !== null) // Remove any failed stats
                .sort((a, b) => new Date(b.created).getTime() - new Date(a.created).getTime());

            res.json(backups);
        } catch (error) {
            console.error('Error getting backups:', error);
            res.status(500).json({ error: 'Failed to get backups', details: error.message });
        }
    },

    // Download a backup file
    downloadBackup: async(req, res) => {
        try {
            const { filename } = req.params;

            // Security check to prevent path traversal
            if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
                return res.status(400).json({ error: 'Invalid filename' });
            }

            const filePath = path.join(__dirname, '..', 'backups', filename);

            // Check if file exists
            try {
                await fs.access(filePath);
            } catch (error) {
                return res.status(404).json({ error: 'Backup file not found' });
            }

            res.download(filePath);
        } catch (error) {
            console.error('Error downloading backup:', error);
            res.status(500).json({ error: 'Failed to download backup' });
        }
    }
};

module.exports = backupController;