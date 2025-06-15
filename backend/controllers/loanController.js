// controllers/loanController.js
const pool = require('../config/database');
const path = require('path');
const fs = require('fs').promises;

const formatDateForMySQL = (dateString) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    date.setHours(date.getHours() + 5);
    date.setMinutes(date.getMinutes() + 30);
    return date.toISOString().slice(0, 19).replace('T', ' ');
};

// Add this at the top of the file
const UPLOAD_DIR = path.join(__dirname, '..', 'uploads', 'loan-proofs');

const loanController = {
    // Get all loans for a client
    getClientLoans: async(req, res) => {
        try {
            const { clientId } = req.params;
            const [rows] = await pool.query(
                'SELECT * FROM loans WHERE client_id = ? ORDER BY disbursement_date DESC', [clientId]
            );
            res.json(rows);
        } catch (error) {
            console.error('Error fetching loans:', error);
            res.status(500).json({ error: 'Failed to fetch loans' });
        }
    },


    createLoan: async(req, res) => {
        const connection = await pool.getConnection();
        try {
            await connection.beginTransaction();

            const { clientId } = req.params;
            const { amount, disbursement_date } = req.body;
            let proofFilePath = null;
            let proofFileName = null;

            // Handle file upload if exists
            if (req.file) {
                proofFileName = req.file.originalname;
                proofFilePath = req.file.path.replace(/\\/g, '/'); // Convert Windows path to URL path
            }

            // Insert loan record
            const [result] = await connection.query(
                `INSERT INTO loans (client_id, amount, disbursement_date, proof_file_name, proof_file_path)
             VALUES (?, ?, ?, ?, ?)`, [clientId, amount, formatDateForMySQL(disbursement_date), proofFileName, proofFilePath]
            );

            // Update client status to 'Disbursed'
            await connection.query(
                `UPDATE clients 
             SET status = 'Disbursed',
                 disbursement_date = ?,
                 updated_at = CURRENT_TIMESTAMP
             WHERE id = ?`, [formatDateForMySQL(disbursement_date), clientId]
            );

            await connection.commit();

            const [newLoan] = await connection.query(
                'SELECT * FROM loans WHERE id = ?', [result.insertId]
            );

            res.status(201).json(newLoan[0]);
        } catch (error) {
            await connection.rollback();
            console.error('Error creating loan:', error);
            res.status(500).json({ error: 'Failed to create loan' });
        } finally {
            connection.release();
        }
    },


    // Get loan proof document
    // Get loan proof document
    getLoanProof: async(req, res) => {
        try {
            const { loanId } = req.params;
            const [loan] = await pool.query(
                'SELECT proof_file_path, proof_file_name FROM loans WHERE id = ?', [loanId]
            );

            if (!loan[0] || !loan[0].proof_file_path) {
                return res.status(404).json({ error: 'Proof document not found' });
            }

            // Get the filename from the path
            const fileName = path.basename(loan[0].proof_file_path);

            // Construct absolute path
            const absolutePath = path.join(UPLOAD_DIR, fileName);

            // Check if file exists
            try {
                await fs.access(absolutePath);
            } catch (err) {
                return res.status(404).json({ error: 'File not found on server' });
            }

            // Set proper content disposition and type
            res.setHeader('Content-Disposition', `inline; filename="${loan[0].proof_file_name}"`);

            // Send the file
            res.sendFile(absolutePath, (err) => {
                if (err) {
                    console.error('Error sending file:', err);
                    res.status(500).json({ error: 'Error sending file' });
                }
            });

        } catch (error) {
            console.error('Error fetching loan proof:', error);
            res.status(500).json({ error: 'Failed to fetch loan proof' });
        }
    }
};

module.exports = loanController;