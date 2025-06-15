//controllers/clientController.js
const pool = require('../config/database');
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
            console.log(req.body);

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