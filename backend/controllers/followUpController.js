// controllers/followUpController.js
const pool = require('../config/database');

const formatDateTimeForMySQL = (dateTimeString) => {
    if (!dateTimeString) return null;
    // Add 5 hours and 30 minutes to compensate for IST
    const date = new Date(dateTimeString);
    date.setHours(date.getHours() + 5);
    date.setMinutes(date.getMinutes() + 30);
    return date.toISOString().slice(0, 19).replace('T', ' ');
};
const followUpController = {
    // Get follow-ups for a client
    getClientFollowUps: async(req, res) => {
        try {
            const { clientId } = req.params;
            const [rows] = await pool.query(
                'SELECT * FROM follow_ups WHERE client_id = ? ORDER BY date DESC', [clientId]
            );
            res.json(rows);
        } catch (error) {
            console.error('Error fetching follow-ups:', error);
            res.status(500).json({ error: 'Failed to fetch follow-ups' });
        }
    },

    // Create follow-up
    createFollowUp: async(req, res) => {
        try {
            const { clientId } = req.params;
            const { notes, next_follow_up_date, type, date } = req.body;

            // Format dates with time for MySQL
            const formattedDate = formatDateTimeForMySQL(date);
            const formattedNextFollowUp = formatDateTimeForMySQL(next_follow_up_date);

            const connection = await pool.getConnection();
            await connection.beginTransaction();

            try {
                // Insert follow-up
                const [result] = await connection.query(
                    `INSERT INTO follow_ups (client_id, notes, type, date, next_follow_up_date)
           VALUES (?, ?, ?, ?, ?)`, [clientId, notes, type, formattedDate, formattedNextFollowUp]
                );

                // Update client's last and next follow-up dates with the same exact timestamps
                await connection.query(
                    `UPDATE clients 
           SET last_follow_up = ?,
               next_follow_up = ?,
               updated_at = CURRENT_TIMESTAMP
           WHERE id = ?`, [formattedDate, formattedNextFollowUp, clientId]
                );

                await connection.commit();

                const [newFollowUp] = await connection.query(
                    'SELECT * FROM follow_ups WHERE id = ?', [result.insertId]
                );

                connection.release();
                res.status(201).json(newFollowUp[0]);
            } catch (err) {
                await connection.rollback();
                connection.release();
                throw err;
            }
        } catch (error) {
            console.error('Error creating follow-up:', error);
            res.status(500).json({ error: 'Failed to create follow-up' });
        }
    }
};

module.exports = followUpController;