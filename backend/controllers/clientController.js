// controllers/clientController.js
const pool = require('../config/database');
const stringSimilarity = require('string-similarity');

const formatDateForMySQL = (dateString) => {
    if (!dateString) return null;
    // Add 5 hours and 30 minutes to compensate for IST
    const date = new Date(dateString);
    date.setHours(date.getHours() + 5);
    date.setMinutes(date.getMinutes() + 30);
    return date.toISOString().slice(0, 19).replace('T', ' ');
};

const clientController = {
    // Get all clients
    getAllClients: async(req, res) => {
        try {
            const [rows] = await pool.query('SELECT * FROM clients ORDER BY created_at DESC');
            res.json(rows);
        } catch (error) {
            console.error('Error fetching clients:', error);
            res.status(500).json({ error: 'Failed to fetch clients' });
        }
    },

    // Check for duplicate clients
    checkDuplicate: async(req, res) => {
        try {
            const { phone_number, customer_name } = req.body;

            // Check by phone number (exact match)
            if (phone_number) {
                const [phoneMatches] = await pool.query(
                    'SELECT * FROM clients WHERE phone_number = ?', [phone_number]
                );

                if (phoneMatches.length > 0) {
                    return res.json({
                        isDuplicate: true,
                        matchType: 'phone',
                        clients: phoneMatches
                    });
                }
            }

            // Check by name (fuzzy match) if name is provided
            if (customer_name) {
                const [allClients] = await pool.query('SELECT id, customer_name, phone_number, business_name FROM clients');
                const matches = allClients.filter(client => {
                    const similarity = stringSimilarity.compareTwoStrings(
                        customer_name.toLowerCase(),
                        client.customer_name.toLowerCase()
                    );
                    return similarity > 0.7; // 70% similarity threshold
                });

                if (matches.length > 0) {
                    // Get full client data for matches
                    const [fullMatches] = await pool.query(
                        'SELECT * FROM clients WHERE id IN (?)', [matches.map(m => m.id)]
                    );

                    return res.json({
                        isDuplicate: true,
                        matchType: 'name',
                        clients: fullMatches
                    });
                }
            }

            res.json({ isDuplicate: false });
        } catch (error) {
            console.error('Error checking duplicate:', error);
            res.status(500).json({ error: 'Failed to check for duplicates' });
        }
    },

    // Search clients
    searchClients: async(req, res) => {
        try {
            const { query } = req.query;

            if (!query || query.length < 3) {
                return res.json([]);
            }

            // Search by name, phone, or business name
            const [rows] = await pool.query(
                `SELECT * FROM clients 
                WHERE customer_name LIKE ? 
                OR phone_number LIKE ? 
                OR business_name LIKE ?
                LIMIT 10`, [`%${query}%`, `%${query}%`, `%${query}%`]
            );

            res.json(rows);
        } catch (error) {
            console.error('Error searching clients:', error);
            res.status(500).json({ error: 'Failed to search clients' });
        }
    },

    // Merge client data
    mergeClient: async(req, res) => {
        try {
            const { id } = req.params;
            const updateData = {...req.body };

            // Get existing client
            const [existing] = await pool.query('SELECT * FROM clients WHERE id = ?', [id]);
            if (!existing[0]) {
                return res.status(404).json({ error: 'Client not found' });
            }

            // Merge data (don't overwrite existing values with empty ones)
            const mergedData = {};

            // Only update fields that have new values
            for (const [key, value] of Object.entries(updateData)) {
                if (value !== '' && value !== null && value !== undefined) {
                    mergedData[key] = value;
                }
            }

            // Update client
            await pool.query('UPDATE clients SET ? WHERE id = ?', [mergedData, id]);

            // Add a follow-up entry to indicate the client returned
            await pool.query(
                `INSERT INTO follow_ups (client_id, type, date, notes)
                VALUES (?, ?, NOW(), ?)`, [id, 'Other', 'Client returned with updated information']
            );

            const [updatedClient] = await pool.query('SELECT * FROM clients WHERE id = ?', [id]);
            res.json(updatedClient[0]);
        } catch (error) {
            console.error('Error merging client:', error);
            res.status(500).json({ error: 'Failed to merge client data' });
        }
    },

    // Get client by ID
    getClientById: async(req, res) => {
        try {
            const { id } = req.params;
            const [rows] = await pool.query('SELECT * FROM clients WHERE id = ?', [id]);

            if (!rows[0]) {
                return res.status(404).json({ error: 'Client not found' });
            }

            res.json(rows[0]);
        } catch (error) {
            console.error('Error fetching client:', error);
            res.status(500).json({ error: 'Failed to fetch client' });
        }
    },

    // Create new client
    createClient: async(req, res) => {
        try {
            const {
                customer_name,
                phone_number,
                business_name,
                monthly_turnover,
                area,
                required_amount,
                old_financier_name,
                old_scheme,
                old_finance_amount,
                new_financier_name,
                new_scheme,
                bank_support,
                remarks,
                reference,
                commission_percentage
            } = req.body;

            // Check if client with this phone number already exists
            if (phone_number) {
                const [existingClients] = await pool.query(
                    'SELECT * FROM clients WHERE phone_number = ?', [phone_number]
                );

                if (existingClients.length > 0) {
                    return res.status(409).json({
                        error: 'Client with this phone number already exists',
                        existingClient: existingClients[0]
                    });
                }
            }

            const [result] = await pool.query(
                `INSERT INTO clients (
                    customer_name, phone_number, business_name, monthly_turnover,
                    area, required_amount, old_financier_name, old_scheme, old_finance_amount,
                    new_financier_name, new_scheme, bank_support, remarks, reference,
                    commission_percentage
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, [
                    customer_name, phone_number, business_name, monthly_turnover,
                    area, required_amount, old_financier_name, old_scheme, old_finance_amount,
                    new_financier_name, new_scheme, bank_support, remarks, reference,
                    commission_percentage
                ]
            );

            const [newClient] = await pool.query('SELECT * FROM clients WHERE id = ?', [result.insertId]);
            res.status(201).json(newClient[0]);
        } catch (error) {
            console.error('Error creating client:', error);
            res.status(500).json({ error: 'Failed to create client' });
        }
    },

    // Update client
    updateClient: async(req, res) => {
        try {
            const { id } = req.params;
            const updateData = {...req.body };

            // Format dates if they exist
            if (updateData.next_follow_up) {
                updateData.next_follow_up = formatDateForMySQL(updateData.next_follow_up);
            }
            if (updateData.last_follow_up) {
                updateData.last_follow_up = formatDateForMySQL(updateData.last_follow_up);
            }

            const [result] = await pool.query(
                'UPDATE clients SET ? WHERE id = ?', [updateData, id]
            );

            if (result.affectedRows === 0) {
                return res.status(404).json({ error: 'Client not found' });
            }

            const [updatedClient] = await pool.query('SELECT * FROM clients WHERE id = ?', [id]);
            res.json(updatedClient[0]);
        } catch (error) {
            console.error('Error updating client:', error);
            res.status(500).json({ error: 'Failed to update client' });
        }
    },

    // Update client status
    updateClientStatus: async(req, res) => {
        try {
            const { id } = req.params;
            const { status } = req.body;

            const [result] = await pool.query(
                'UPDATE clients SET status = ?, status_updated_at = CURRENT_TIMESTAMP WHERE id = ?', [status, id]
            );

            if (result.affectedRows === 0) {
                return res.status(404).json({ error: 'Client not found' });
            }

            res.json({ message: 'Status updated successfully' });
        } catch (error) {
            console.error('Error updating client status:', error);
            res.status(500).json({ error: 'Failed to update client status' });
        }
    },

    // Delete client
    deleteClient: async(req, res) => {
        try {
            const { id } = req.params;

            const [result] = await pool.query('DELETE FROM clients WHERE id = ?', [id]);

            if (result.affectedRows === 0) {
                return res.status(404).json({ error: 'Client not found' });
            }

            res.json({ message: 'Client deleted successfully' });
        } catch (error) {
            console.error('Error deleting client:', error);
            res.status(500).json({ error: 'Failed to delete client' });
        }
    }
};

module.exports = clientController;