// routes/loanRoutes.js
const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const loanController = require('../controllers/loanController');

const router = express.Router();

// Define upload directory
const UPLOAD_DIR = path.join(__dirname, '..', 'uploads', 'loan-proofs');

// Ensure upload directory exists
if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, UPLOAD_DIR);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
        const ext = path.extname(file.originalname);
        cb(null, `proof-${uniqueSuffix}${ext}`);
    }
});

const upload = multer({
    storage,
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB limit
    },
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|pdf/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);

        if (extname && mimetype) {
            return cb(null, true);
        }
        cb(new Error('Only .png, .jpg, .jpeg and .pdf format allowed!'));
    }
});

router.get('/client/:clientId', loanController.getClientLoans);
router.post('/client/:clientId', upload.single('proof'), loanController.createLoan);
router.get('/proof/:loanId', loanController.getLoanProof);

module.exports = router;