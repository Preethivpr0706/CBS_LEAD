// controllers/loanController.js
const pool = require('../config/database');
const path = require('path');
const fs = require('fs').promises;
const backupService = require('../services/backupService');

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
            // Update backup after creating loan
            try {
                await backupService.updateBackupForLoan(result.insertId, parseInt(clientId), 'create');
                console.log(`Backup updated for new loan ID: ${result.insertId}`);
            } catch (backupError) {
                console.error('Error updating backup for new loan:', backupError);
                // Continue with the response even if backup fails
            }
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
    },
    // Update loan
    updateLoan: async(req, res) => {
        try {
            const { id } = req.params;
            const { amount, disbursement_date } = req.body;

            // Get client ID for backup
            const [loanData] = await pool.query('SELECT client_id FROM loans WHERE id = ?', [id]);
            if (loanData.length === 0) {
                return res.status(404).json({ error: 'Loan not found' });
            }
            const clientId = loanData[0].client_id;

            const [result] = await pool.query(
                'UPDATE loans SET amount = ?, disbursement_date = ? WHERE id = ?', [amount, disbursement_date, id]
            );

            if (result.affectedRows === 0) {
                return res.status(404).json({ error: 'Loan not found' });
            }

            const [updatedLoan] = await pool.query('SELECT * FROM loans WHERE id = ?', [id]);

            // Update backup after updating loan
            try {
                await backupService.updateBackupForLoan(parseInt(id), clientId, 'update');
                console.log(`Backup updated for loan ID: ${id}`);
            } catch (backupError) {
                console.error('Error updating backup for loan:', backupError);
                // Continue with the response even if backup fails
            }

            res.json(updatedLoan[0]);
        } catch (error) {
            console.error('Error updating loan:', error);
            res.status(500).json({ error: 'Failed to update loan' });
        }
    },

    // Delete loan
    deleteLoan: async(req, res) => {
        try {
            const { id } = req.params;

            // Get client ID and file info for backup and cleanup
            const [loanData] = await pool.query(
                'SELECT client_id, proof_file_path FROM loans WHERE id = ?', [id]
            );

            if (loanData.length === 0) {
                return res.status(404).json({ error: 'Loan not found' });
            }

            const clientId = loanData[0].client_id;
            const proofFilePath = loanData[0].proof_file_path;

            // Update backup before deleting loan
            try {
                await backupService.updateBackupForLoan(parseInt(id), clientId, 'delete');
                console.log(`Backup updated for deleted loan ID: ${id}`);
            } catch (backupError) {
                console.error('Error updating backup for loan deletion:', backupError);
                // Continue with deletion even if backup fails
            }

            // Delete the loan record
            const [result] = await pool.query('DELETE FROM loans WHERE id = ?', [id]);

            if (result.affectedRows === 0) {
                return res.status(404).json({ error: 'Loan not found' });
            }

            // Delete the proof file if it exists
            if (proofFilePath) {
                try {
                    const fullPath = path.join(__dirname, '..', 'public', proofFilePath);
                    await fs.unlink(fullPath);
                    console.log(`Deleted proof file: ${fullPath}`);
                } catch (fileError) {
                    console.error('Error deleting proof file:', fileError);
                    // Continue even if file deletion fails
                }
            }

            res.json({ message: 'Loan deleted successfully' });
        } catch (error) {
            console.error('Error deleting loan:', error);
            res.status(500).json({ error: 'Failed to delete loan' });
        }
    }
};

module.exports = loanController;