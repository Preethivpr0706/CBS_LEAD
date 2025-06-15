// controllers/documentController.js
const pool = require('../config/database');
const path = require('path');
const fs = require('fs').promises;

const documentController = {
    // Get all documents
    getAllDocuments: async(req, res) => {
        try {
            const [rows] = await pool.query(
                'SELECT * FROM documents ORDER BY upload_date DESC'
            );
            res.json(rows);
        } catch (error) {
            console.error('Error fetching documents:', error);
            res.status(500).json({ error: 'Failed to fetch documents' });
        }
    },

    // Get all folders
    getAllFolders: async(req, res) => {
        try {
            const [rows] = await pool.query('SELECT * FROM folders ORDER BY name');
            res.json(rows.map(row => row.name));
        } catch (error) {
            console.error('Error fetching folders:', error);
            res.status(500).json({ error: 'Failed to fetch folders' });
        }
    },

    // Upload document
    uploadDocument: async(req, res) => {
        try {
            const { folder } = req.body;
            const file = req.file;

            if (!file) {
                return res.status(400).json({ error: 'No file uploaded' });
            }

            const [result] = await pool.query(
                `INSERT INTO documents (
                    name, folder, size, type, file_path, original_name
                ) VALUES (?, ?, ?, ?, ?, ?)`, [
                    file.filename,
                    folder,
                    file.size,
                    file.mimetype,
                    file.path,
                    file.originalname
                ]
            );

            const [newDocument] = await pool.query(
                'SELECT * FROM documents WHERE id = ?', [result.insertId]
            );

            res.status(201).json(newDocument[0]);
        } catch (error) {
            console.error('Error uploading document:', error);
            res.status(500).json({ error: 'Failed to upload document' });
        }
    },

    // Create new folder
    createFolder: async(req, res) => {
        try {
            const { name } = req.body;

            // Create folder in database
            const [result] = await pool.query(
                'INSERT INTO folders (name) VALUES (?)', [name]
            );

            // Create physical folder
            const folderPath = path.join(__dirname, '..', 'uploads', 'documents', name);
            await fs.mkdir(folderPath, { recursive: true });

            res.status(201).json({ name });
        } catch (error) {
            console.error('Error creating folder:', error);
            res.status(500).json({ error: 'Failed to create folder' });
        }
    },

    // Download document
    downloadDocument: async(req, res) => {
        try {
            const { id } = req.params;
            const [document] = await pool.query(
                'SELECT * FROM documents WHERE id = ?', [id]
            );

            if (!document[0]) {
                return res.status(404).json({ error: 'Document not found' });
            }

            res.download(document[0].file_path, document[0].original_name);
        } catch (error) {
            console.error('Error downloading document:', error);
            res.status(500).json({ error: 'Failed to download document' });
        }
    },

    // Delete document
    deleteDocument: async(req, res) => {
        try {
            const { id } = req.params;
            const [document] = await pool.query(
                'SELECT * FROM documents WHERE id = ?', [id]
            );

            if (!document[0]) {
                return res.status(404).json({ error: 'Document not found' });
            }

            // Delete file from filesystem
            await fs.unlink(document[0].file_path);

            // Delete from database
            await pool.query('DELETE FROM documents WHERE id = ?', [id]);

            res.json({ message: 'Document deleted successfully' });
        } catch (error) {
            console.error('Error deleting document:', error);
            res.status(500).json({ error: 'Failed to delete document' });
        }
    }
};

module.exports = documentController;