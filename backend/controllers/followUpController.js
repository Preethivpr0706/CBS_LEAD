// controllers/followUpController.js
const pool = require('../config/database');
const backupService = require('../services/backupService');

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
                // Update backup after creating follow-up
                try {
                    await backupService.updateBackupForFollowUp(result.insertId, parseInt(clientId), 'create');
                    console.log(`Backup updated for new follow-up ID: ${result.insertId}`);
                } catch (backupError) {
                    console.error('Error updating backup for new follow-up:', backupError);
                    // Continue with the response even if backup fails
                }
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
    },
    // Update follow-up
    updateFollowUp: async(req, res) => {
        try {
            const { id } = req.params;
            const { type, date, notes, next_follow_up_date } = req.body;

            // Get client ID for backup
            const [followUpData] = await pool.query('SELECT client_id FROM follow_ups WHERE id = ?', [id]);
            if (followUpData.length === 0) {
                return res.status(404).json({ error: 'Follow-up not found' });
            }
            const clientId = followUpData[0].client_id;

            const [result] = await pool.query(
                `UPDATE follow_ups 
                SET type = ?, date = ?, notes = ?, next_follow_up_date = ?
                WHERE id = ?`, [type, date, notes, next_follow_up_date, id]
            );

            if (result.affectedRows === 0) {
                return res.status(404).json({ error: 'Follow-up not found' });
            }

            // Update client's next follow-up date if provided
            if (next_follow_up_date) {
                await pool.query(
                    'UPDATE clients SET next_follow_up = ? WHERE id = ?', [next_follow_up_date, clientId]
                );

                // Update backup for client as well
                try {
                    await backupService.updateBackupForClient(clientId, 'update');
                    console.log(`Backup updated for client ID: ${clientId} (follow-up date update)`);
                } catch (backupError) {
                    console.error('Error updating backup for client follow-up date:', backupError);
                }
            }

            const [updatedFollowUp] = await pool.query('SELECT * FROM follow_ups WHERE id = ?', [id]);

            // Update backup after updating follow-up
            try {
                await backupService.updateBackupForFollowUp(parseInt(id), clientId, 'update');
                console.log(`Backup updated for follow-up ID: ${id}`);
            } catch (backupError) {
                console.error('Error updating backup for follow-up:', backupError);
                // Continue with the response even if backup fails
            }

            res.json(updatedFollowUp[0]);
        } catch (error) {
            console.error('Error updating follow-up:', error);
            res.status(500).json({ error: 'Failed to update follow-up' });
        }
    },

    // Delete follow-up
    deleteFollowUp: async(req, res) => {
        try {
            const { id } = req.params;

            // Get client ID for backup
            const [followUpData] = await pool.query('SELECT client_id FROM follow_ups WHERE id = ?', [id]);
            if (followUpData.length === 0) {
                return res.status(404).json({ error: 'Follow-up not found' });
            }
            const clientId = followUpData[0].client_id;

            // Update backup before deleting follow-up
            try {
                await backupService.updateBackupForFollowUp(parseInt(id), clientId, 'delete');
                console.log(`Backup updated for deleted follow-up ID: ${id}`);
            } catch (backupError) {
                console.error('Error updating backup for follow-up deletion:', backupError);
                // Continue with deletion even if backup fails
            }

            const [result] = await pool.query('DELETE FROM follow_ups WHERE id = ?', [id]);

            if (result.affectedRows === 0) {
                return res.status(404).json({ error: 'Follow-up not found' });
            }

            // Update client's next follow-up date if this was the latest follow-up
            const [latestFollowUp] = await pool.query(
                `SELECT * FROM follow_ups 
                WHERE client_id = ? 
                ORDER BY next_follow_up_date DESC 
                LIMIT 1`, [clientId]
            );

            if (latestFollowUp.length > 0) {
                await pool.query(
                    'UPDATE clients SET next_follow_up = ? WHERE id = ?', [latestFollowUp[0].next_follow_up_date, clientId]
                );
            } else {
                await pool.query(
                    'UPDATE clients SET next_follow_up = NULL WHERE id = ?', [clientId]
                );
            }

            // Update backup for client as well
            try {
                await backupService.updateBackupForClient(clientId, 'update');
                console.log(`Backup updated for client ID: ${clientId} (follow-up deletion)`);
            } catch (backupError) {
                console.error('Error updating backup for client after follow-up deletion:', backupError);
            }

            res.json({ message: 'Follow-up deleted successfully' });
        } catch (error) {
            console.error('Error deleting follow-up:', error);
            res.status(500).json({ error: 'Failed to delete follow-up' });
        }
    }
};

module.exports = followUpController;