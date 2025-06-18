// controllers/authController.js
const pool = require('../config/database');

const authController = {
    // Login user
    login: async(req, res) => {
        try {
            const { email, password } = req.body;

            // Check if credentials match
            const [rows] = await pool.query(
                'SELECT admin_email, admin_name, admin_password FROM company_settings WHERE id = 1'
            );

            if (!rows[0] || rows[0].admin_email !== email || rows[0].admin_password !== password) {
                return res.status(401).json({ error: 'Invalid email or password' });
            }

            // Return user data
            res.json({
                user: {
                    id: 1,
                    name: rows[0].admin_name,
                    email: rows[0].admin_email
                }
            });
        } catch (error) {
            console.error('Login error:', error);
            res.status(500).json({ error: 'An error occurred during login' });
        }
    },

    // Change password
    changePassword: async(req, res) => {
        try {
            const { currentPassword, newPassword } = req.body;

            // Verify current password
            const [rows] = await pool.query(
                'SELECT admin_password FROM company_settings WHERE id = 1'
            );

            if (!rows[0] || rows[0].admin_password !== currentPassword) {
                return res.status(401).json({ error: 'Current password is incorrect' });
            }

            // Update password
            await pool.query(
                'UPDATE company_settings SET admin_password = ? WHERE id = 1', [newPassword]
            );

            res.json({ message: 'Password updated successfully' });
        } catch (error) {
            console.error('Error changing password:', error);
            res.status(500).json({ error: 'Failed to change password' });
        }
    }
};

module.exports = authController;