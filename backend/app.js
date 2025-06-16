// app.js
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const clientRoutes = require('./routes/clientRoutes');
const followUpRoutes = require('./routes/followUpRoutes');
const loanRoutes = require('./routes/loanRoutes');
const documentRoutes = require('./routes/documentRoutes');
const reminderService = require('./services/reminderService');
const app = express();


// Create uploads directory structure
const UPLOAD_DIR = path.join(__dirname, 'uploads');
const LOAN_PROOFS_DIR = path.join(UPLOAD_DIR, 'loan-proofs');

// Create directories if they don't exist
try {
    if (!fs.existsSync(UPLOAD_DIR)) {
        fs.mkdirSync(UPLOAD_DIR);
    }
    if (!fs.existsSync(LOAN_PROOFS_DIR)) {
        fs.mkdirSync(LOAN_PROOFS_DIR);
    }
} catch (err) {
    console.error('Error creating upload directories:', err);
}


// Create document uploads directory
const DOCUMENTS_DIR = path.join(UPLOAD_DIR, 'documents');
if (!fs.existsSync(DOCUMENTS_DIR)) {
    fs.mkdirSync(DOCUMENTS_DIR, { recursive: true });
}


app.use(cors());
app.use(express.json());

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api/clients', clientRoutes);
app.use('/api/follow-ups', followUpRoutes);
app.use('/api/loans', loanRoutes);
// Add document routes
app.use('/api/documents', documentRoutes);

// Schedule follow-up reminders (every 30 minutes)
const REMINDER_INTERVAL = 30 * 60 * 1000; // 30 minutes
setInterval(reminderService.checkFollowUpReminders, REMINDER_INTERVAL);

// Run once on startup
reminderService.checkFollowUpReminders();

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        error: 'Something went wrong!',
        details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});