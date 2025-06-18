// controllers/settingsController.js
const pool = require('../config/database');
const path = require('path');
const fs = require('fs').promises;

const settingsController = {
    // Get company settings
    getSettings: async(req, res) => {
        try {
            const [rows] = await pool.query('SELECT * FROM company_settings WHERE id = 1');

            if (!rows[0]) {
                // Create default settings if none exist
                const defaultSettings = {
                    company_name: 'Chetana Business Solutions',
                    company_email: 'info@chetana.com',
                    company_phone: '',
                    company_address: '',
                    notifications_email: 'harishradhakrishnan2001@gmail.com',
                    reminder_time_before: 2,
                    notification_enabled: true,
                    admin_email: 'admin@chetana.com',
                    admin_name: 'Admin User'
                };

                await pool.query(
                    `INSERT INTO company_settings SET ?`, [defaultSettings]
                );

                return res.json({ id: 1, ...defaultSettings });
            }

            // Don't return sensitive data
            const settings = {...rows[0] };
            delete settings.admin_password;
            res.json(settings);
        } catch (error) {
            console.error('Error fetching settings:', error);
            res.status(500).json({ error: 'Failed to fetch settings' });
        }
    },

    // Update company settings
    updateSettings: async(req, res) => {
        try {
            const {
                company_name,
                company_email,
                company_phone,
                company_address,
                notification_email,
                reminder_time_before,
                notifications_enabled,
                admin_email,
                admin_name
            } = req.body;

            // Don't allow updating admin_password through this endpoint
            const [result] = await pool.query(
                `UPDATE company_settings SET 
        company_name = ?,
        company_email = ?,
        company_phone = ?,
        company_address = ?,
        notification_email = ?,
        reminder_time_before = ?,
        notifications_enabled = ?,
        admin_email = ?,
        admin_name = ?
        WHERE id = 1`, [
                    company_name,
                    company_email,
                    company_phone,
                    company_address,
                    notification_email,
                    reminder_time_before,
                    notifications_enabled,
                    admin_email,
                    admin_name
                ]
            );

            if (result.affectedRows === 0) {
                // Insert if not exists
                await pool.query(
                    `INSERT INTO company_settings (
            id, company_name, company_email, company_phone, company_address,
            notification_email, reminder_time_before, notifications_enabled,
            admin_email, admin_name
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?,?, ?)`, [
                        1, company_name, company_email, company_phone, company_address,
                        notification_email, reminder_time_before, notifications_enabled,
                        admin_email, admin_name
                    ]
                );
            }

            res.json({ message: 'Settings updated successfully' });
        } catch (error) {
            console.error('Error updating settings:', error);
            res.status(500).json({ error: 'Failed to update settings' });
        }
    },

    // Upload logo
    uploadLogo: async(req, res) => {
        try {
            if (!req.file) {
                return res.status(400).json({ error: 'No file uploaded' });
            }

            // Update logo URL in database
            const logoUrl = `/uploads/logo/${req.file.filename}`;
            await pool.query(
                'UPDATE company_settings SET logo_url = ? WHERE id = 1', [logoUrl]
            );

            res.json({
                message: 'Logo uploaded successfully',
                logo_url: logoUrl
            });
        } catch (error) {
            console.error('Error uploading logo:', error);
            res.status(500).json({ error: 'Failed to upload logo' });
        }
    }
};

module.exports = settingsController;