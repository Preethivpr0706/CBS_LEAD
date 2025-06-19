// server/services/backupService.js
const ExcelJS = require('exceljs');
const fs = require('fs').promises;
const path = require('path');
const pool = require('../config/database');
const { format } = require('date-fns');

class BackupService {
    constructor() {
        this.backupDir = path.join(__dirname, '..', 'backups');
        this.ensureBackupDirExists();
    }

    async ensureBackupDirExists() {
        try {
            await fs.mkdir(this.backupDir, { recursive: true });
        } catch (error) {
            console.error('Error creating backup directory:', error);
        }
    }

    async createFullBackup() {
        try {
            const timestamp = format(new Date(), 'yyyy-MM-dd_HH-mm-ss');
            const filename = `backup_${timestamp}.xlsx`;
            const filePath = path.join(this.backupDir, filename);

            // Ensure the backup directory exists
            await this.ensureBackupDirExists();

            const workbook = new ExcelJS.Workbook();

            // Add metadata
            workbook.creator = 'Chetana Business Solutions';
            workbook.lastModifiedBy = 'Backup System';
            workbook.created = new Date();
            workbook.modified = new Date();

            // Create sheets for each data type
            await this.createClientsSheet(workbook);
            await this.createLoansSheet(workbook);
            await this.createFollowUpsSheet(workbook);

            // Save the workbook with proper options to prevent temporary files
            await workbook.xlsx.writeFile(filePath);

            // Clean up any temporary files
            const files = await fs.readdir(this.backupDir);
            for (const file of files) {
                if (file.startsWith('~') && file.endsWith('.xlsx')) {
                    try {
                        await fs.unlink(path.join(this.backupDir, file));
                        console.log(`Removed temporary file: ${file}`);
                    } catch (err) {
                        console.error(`Failed to remove temporary file ${file}:`, err);
                    }
                }
            }

            console.log(`Backup created successfully: ${filename}`);
            return filePath;
        } catch (error) {
            console.error('Error creating backup:', error);
            throw error;
        }
    }


    async createClientsSheet(workbook) {
        const sheet = workbook.addWorksheet('Clients');

        // Define columns
        sheet.columns = [
            { header: 'ID', key: 'id', width: 10 },
            { header: 'Customer Name', key: 'customer_name', width: 30 },
            { header: 'Phone Number', key: 'phone_number', width: 15 },
            { header: 'Business Name', key: 'business_name', width: 30 },
            { header: 'Area', key: 'area', width: 20 },
            { header: 'Monthly Turnover', key: 'monthly_turnover', width: 15 },
            { header: 'Required Amount', key: 'required_amount', width: 15 },
            { header: 'Status', key: 'status', width: 15 },
            { header: 'Old Financier', key: 'old_financier_name', width: 20 },
            { header: 'Old Scheme', key: 'old_scheme', width: 20 },
            { header: 'Old Finance Amount', key: 'old_finance_amount', width: 15 },
            { header: 'New Financier', key: 'new_financier_name', width: 20 },
            { header: 'New Scheme', key: 'new_scheme', width: 20 },
            { header: 'Bank Support', key: 'bank_support', width: 15 },
            { header: 'Remarks', key: 'remarks', width: 30 },
            { header: 'Reference', key: 'reference', width: 20 },
            { header: 'Commission %', key: 'commission_percentage', width: 15 },
            { header: 'Created At', key: 'created_at', width: 20 },
            { header: 'Updated At', key: 'updated_at', width: 20 },
            { header: 'Status Updated At', key: 'status_updated_at', width: 20 },
            { header: 'Last Follow-up', key: 'last_follow_up', width: 20 },
            { header: 'Next Follow-up', key: 'next_follow_up', width: 20 }
        ];

        // Style the header row
        sheet.getRow(1).font = { bold: true };
        sheet.getRow(1).fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: '4167B8' }
        };
        sheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFF' } };

        // Get client data from database
        const [clients] = await pool.query('SELECT * FROM clients');

        // Add rows to the sheet
        clients.forEach(client => {
            // Format dates for better readability
            const formattedClient = {...client };

            if (formattedClient.created_at) {
                formattedClient.created_at = format(new Date(formattedClient.created_at), 'yyyy-MM-dd HH:mm:ss');
            }

            if (formattedClient.updated_at) {
                formattedClient.updated_at = format(new Date(formattedClient.updated_at), 'yyyy-MM-dd HH:mm:ss');
            }

            if (formattedClient.status_updated_at) {
                formattedClient.status_updated_at = format(new Date(formattedClient.status_updated_at), 'yyyy-MM-dd HH:mm:ss');
            }

            if (formattedClient.last_follow_up) {
                formattedClient.last_follow_up = format(new Date(formattedClient.last_follow_up), 'yyyy-MM-dd HH:mm:ss');
            }

            if (formattedClient.next_follow_up) {
                formattedClient.next_follow_up = format(new Date(formattedClient.next_follow_up), 'yyyy-MM-dd HH:mm:ss');
            }

            // Convert boolean to Yes/No
            formattedClient.bank_support = formattedClient.bank_support ? 'Yes' : 'No';

            sheet.addRow(formattedClient);
        });

        // Add auto filter
        sheet.autoFilter = {
            from: { row: 1, column: 1 },
            to: { row: 1, column: sheet.columns.length }
        };

        return sheet;
    }

    async createLoansSheet(workbook) {
        const sheet = workbook.addWorksheet('Loans');

        // Define columns
        sheet.columns = [
            { header: 'ID', key: 'id', width: 10 },
            { header: 'Client ID', key: 'client_id', width: 10 },
            { header: 'Client Name', key: 'client_name', width: 30 },
            { header: 'Amount', key: 'amount', width: 15 },
            { header: 'Disbursement Date', key: 'disbursement_date', width: 20 },
            { header: 'Proof File', key: 'proof_file_name', width: 30 },
            { header: 'Created At', key: 'created_at', width: 20 }
        ];

        // Style the header row
        sheet.getRow(1).font = { bold: true };
        sheet.getRow(1).fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: '4167B8' }
        };
        sheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFF' } };

        // Get loan data from database with client names
        const [loans] = await pool.query(`
      SELECT l.*, c.customer_name as client_name
      FROM loans l
      JOIN clients c ON l.client_id = c.id
    `);

        // Add rows to the sheet
        loans.forEach(loan => {
            // Format dates for better readability
            const formattedLoan = {...loan };

            if (formattedLoan.created_at) {
                formattedLoan.created_at = format(new Date(formattedLoan.created_at), 'yyyy-MM-dd HH:mm:ss');
            }

            if (formattedLoan.disbursement_date) {
                formattedLoan.disbursement_date = format(new Date(formattedLoan.disbursement_date), 'yyyy-MM-dd');
            }

            sheet.addRow(formattedLoan);
        });

        // Add auto filter
        sheet.autoFilter = {
            from: { row: 1, column: 1 },
            to: { row: 1, column: sheet.columns.length }
        };

        return sheet;
    }

    async createFollowUpsSheet(workbook) {
        const sheet = workbook.addWorksheet('Follow-ups');

        // Define columns
        sheet.columns = [
            { header: 'ID', key: 'id', width: 10 },
            { header: 'Client ID', key: 'client_id', width: 10 },
            { header: 'Client Name', key: 'client_name', width: 30 },
            { header: 'Type', key: 'type', width: 15 },
            { header: 'Date', key: 'date', width: 20 },
            { header: 'Notes', key: 'notes', width: 40 },
            { header: 'Next Follow-up Date', key: 'next_follow_up_date', width: 20 },
            { header: 'Created At', key: 'created_at', width: 20 },
            { header: 'Reminder Sent', key: 'reminder_sent', width: 15 }
        ];

        // Style the header row
        sheet.getRow(1).font = { bold: true };
        sheet.getRow(1).fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: '4167B8' }
        };
        sheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFF' } };

        // Get follow-up data from database with client names
        const [followUps] = await pool.query(`
      SELECT f.*, c.customer_name as client_name
      FROM follow_ups f
      JOIN clients c ON f.client_id = c.id
    `);

        // Add rows to the sheet
        followUps.forEach(followUp => {
            // Format dates for better readability
            const formattedFollowUp = {...followUp };

            if (formattedFollowUp.created_at) {
                formattedFollowUp.created_at = format(new Date(formattedFollowUp.created_at), 'yyyy-MM-dd HH:mm:ss');
            }

            if (formattedFollowUp.date) {
                formattedFollowUp.date = format(new Date(formattedFollowUp.date), 'yyyy-MM-dd HH:mm:ss');
            }

            if (formattedFollowUp.next_follow_up_date) {
                formattedFollowUp.next_follow_up_date = format(new Date(formattedFollowUp.next_follow_up_date), 'yyyy-MM-dd');
            }

            // Convert boolean to Yes/No
            formattedFollowUp.reminder_sent = formattedFollowUp.reminder_sent ? 'Yes' : 'No';

            sheet.addRow(formattedFollowUp);
        });

        // Add auto filter
        sheet.autoFilter = {
            from: { row: 1, column: 1 },
            to: { row: 1, column: sheet.columns.length }
        };

        return sheet;
    }

    async getLatestBackup() {
        try {
            const files = await fs.readdir(this.backupDir);
            const backupFiles = files.filter(file => file.startsWith('backup_') && file.endsWith('.xlsx'));

            if (backupFiles.length === 0) {
                return null;
            }

            // Sort files by creation date (newest first)
            backupFiles.sort((a, b) => {
                const timeA = a.replace('backup_', '').replace('.xlsx', '');
                const timeB = b.replace('backup_', '').replace('.xlsx', '');
                return timeB.localeCompare(timeA);
            });

            return path.join(this.backupDir, backupFiles[0]);
        } catch (error) {
            console.error('Error getting latest backup:', error);
            return null;
        }
    }

    async updateBackupForClient(clientId, action) {
        try {
            const latestBackupPath = await this.getLatestBackup();

            if (!latestBackupPath) {
                // No existing backup, create a new one
                return await this.createFullBackup();
            }

            const workbook = new ExcelJS.Workbook();
            await workbook.xlsx.readFile(latestBackupPath);

            const clientsSheet = workbook.getWorksheet('Clients');

            // Get column indexes by header names
            const headerRow = clientsSheet.getRow(1);
            const columnIndexes = {};
            headerRow.eachCell((cell, colNumber) => {
                columnIndexes[cell.value] = colNumber;
            });

            if (action === 'delete') {
                // Find and remove the client row
                let rowToDelete = null;
                clientsSheet.eachRow((row, rowNumber) => {
                    if (rowNumber > 1) { // Skip header row
                        const idCell = row.getCell(columnIndexes['ID']);
                        if (idCell && idCell.value === clientId) {
                            rowToDelete = rowNumber;
                        }
                    }
                });

                if (rowToDelete) {
                    clientsSheet.spliceRows(rowToDelete, 1);
                }
            } else {
                // Get updated client data
                const [clients] = await pool.query('SELECT * FROM clients WHERE id = ?', [clientId]);

                if (clients.length === 0) {
                    return latestBackupPath;
                }

                const client = clients[0];

                // Format dates
                if (client.created_at) {
                    client.created_at = format(new Date(client.created_at), 'yyyy-MM-dd HH:mm:ss');
                }

                if (client.updated_at) {
                    client.updated_at = format(new Date(client.updated_at), 'yyyy-MM-dd HH:mm:ss');
                }

                if (client.status_updated_at) {
                    client.status_updated_at = format(new Date(client.status_updated_at), 'yyyy-MM-dd HH:mm:ss');
                }

                if (client.last_follow_up) {
                    client.last_follow_up = format(new Date(client.last_follow_up), 'yyyy-MM-dd HH:mm:ss');
                }

                if (client.next_follow_up) {
                    client.next_follow_up = format(new Date(client.next_follow_up), 'yyyy-MM-dd');
                }

                // Convert boolean to Yes/No
                client.bank_support = client.bank_support ? 'Yes' : 'No';

                // Check if client already exists in the sheet
                let existingRow = null;
                clientsSheet.eachRow((row, rowNumber) => {
                    if (rowNumber > 1) { // Skip header row
                        const idCell = row.getCell(columnIndexes['ID']);
                        if (idCell && idCell.value === clientId) {
                            existingRow = row;
                        }
                    }
                });

                if (existingRow) {
                    // Update existing row
                    Object.keys(client).forEach(key => {
                        // Map database column names to Excel column names
                        const excelColumnName = this.mapDbColumnToExcel(key);
                        const columnIndex = columnIndexes[excelColumnName];

                        if (columnIndex) {
                            existingRow.getCell(columnIndex).value = client[key];
                        }
                    });
                } else {
                    // Add new row with data in the correct order
                    const rowData = [];
                    clientsSheet.columns.forEach((column, index) => {
                        const dbColumnName = this.mapExcelColumnToDb(column.header);
                        rowData.push(client[dbColumnName] || null);
                    });
                    clientsSheet.addRow(rowData);
                }
            }

            // Save the updated workbook
            await workbook.xlsx.writeFile(latestBackupPath);
            return latestBackupPath;
        } catch (error) {
            console.error('Error updating backup for client:', error);
            // If update fails, create a new full backup
            return await this.createFullBackup();
        }
    }

    // Helper method to map database column names to Excel column names
    mapDbColumnToExcel(dbColumn) {
        const mapping = {
            'id': 'ID',
            'customer_name': 'Customer Name',
            'phone_number': 'Phone Number',
            'business_name': 'Business Name',
            'area': 'Area',
            'monthly_turnover': 'Monthly Turnover',
            'required_amount': 'Required Amount',
            'status': 'Status',
            'old_financier_name': 'Old Financier',
            'old_scheme': 'Old Scheme',
            'old_finance_amount': 'Old Finance Amount',
            'new_financier_name': 'New Financier',
            'new_scheme': 'New Scheme',
            'bank_support': 'Bank Support',
            'remarks': 'Remarks',
            'reference': 'Reference',
            'commission_percentage': 'Commission %',
            'created_at': 'Created At',
            'updated_at': 'Updated At',
            'status_updated_at': 'Status Updated At',
            'last_follow_up': 'Last Follow-up',
            'next_follow_up': 'Next Follow-up'
        };
        return mapping[dbColumn] || dbColumn;
    }

    // Helper method to map Excel column names to database column names
    mapExcelColumnToDb(excelColumn) {
        const mapping = {
            'ID': 'id',
            'Customer Name': 'customer_name',
            'Phone Number': 'phone_number',
            'Business Name': 'business_name',
            'Area': 'area',
            'Monthly Turnover': 'monthly_turnover',
            'Required Amount': 'required_amount',
            'Status': 'status',
            'Old Financier': 'old_financier_name',
            'Old Scheme': 'old_scheme',
            'Old Finance Amount': 'old_finance_amount',
            'New Financier': 'new_financier_name',
            'New Scheme': 'new_scheme',
            'Bank Support': 'bank_support',
            'Remarks': 'remarks',
            'Reference': 'reference',
            'Commission %': 'commission_percentage',
            'Created At': 'created_at',
            'Updated At': 'updated_at',
            'Status Updated At': 'status_updated_at',
            'Last Follow-up': 'last_follow_up',
            'Next Follow-up': 'next_follow_up'
        };
        return mapping[excelColumn] || excelColumn;
    }


    async updateBackupForLoan(loanId, clientId, action) {
        try {
            const latestBackupPath = await this.getLatestBackup();

            if (!latestBackupPath) {
                // No existing backup, create a new one
                return await this.createFullBackup();
            }

            const workbook = new ExcelJS.Workbook();
            await workbook.xlsx.readFile(latestBackupPath);

            const loansSheet = workbook.getWorksheet('Loans');

            // Get column indexes by header names
            const headerRow = loansSheet.getRow(1);
            const columnIndexes = {};
            headerRow.eachCell((cell, colNumber) => {
                columnIndexes[cell.value] = colNumber;
            });

            if (action === 'delete') {
                // Find and remove the loan row
                let rowToDelete = null;
                loansSheet.eachRow((row, rowNumber) => {
                    if (rowNumber > 1) { // Skip header row
                        const idCell = row.getCell(columnIndexes['ID']);
                        if (idCell && idCell.value === loanId) {
                            rowToDelete = rowNumber;
                        }
                    }
                });

                if (rowToDelete) {
                    loansSheet.spliceRows(rowToDelete, 1);
                }
            } else {
                // Get updated loan data with client name
                const [loans] = await pool.query(`
                SELECT l.*, c.customer_name as client_name
                FROM loans l
                JOIN clients c ON l.client_id = c.id
                WHERE l.id = ?
            `, [loanId]);

                if (loans.length === 0) {
                    return latestBackupPath;
                }

                const loan = loans[0];

                // Format dates
                if (loan.created_at) {
                    loan.created_at = format(new Date(loan.created_at), 'yyyy-MM-dd HH:mm:ss');
                }

                if (loan.disbursement_date) {
                    loan.disbursement_date = format(new Date(loan.disbursement_date), 'yyyy-MM-dd');
                }

                // Check if loan already exists in the sheet
                let existingRow = null;
                loansSheet.eachRow((row, rowNumber) => {
                    if (rowNumber > 1) { // Skip header row
                        const idCell = row.getCell(columnIndexes['ID']);
                        if (idCell && idCell.value === loanId) {
                            existingRow = row;
                        }
                    }
                });

                if (existingRow) {
                    // Update existing row
                    Object.keys(loan).forEach(key => {
                        // Map database column names to Excel column names
                        const excelColumnName = this.mapLoanDbColumnToExcel(key);
                        const columnIndex = columnIndexes[excelColumnName];

                        if (columnIndex) {
                            existingRow.getCell(columnIndex).value = loan[key];
                        }
                    });
                } else {
                    // Add new row with data in the correct order
                    const rowData = [];
                    loansSheet.columns.forEach((column, index) => {
                        const dbColumnName = this.mapLoanExcelColumnToDb(column.header);
                        rowData.push(loan[dbColumnName] || null);
                    });
                    loansSheet.addRow(rowData);
                }
            }

            // Save the updated workbook
            await workbook.xlsx.writeFile(latestBackupPath);
            return latestBackupPath;
        } catch (error) {
            console.error('Error updating backup for loan:', error);
            // If update fails, create a new full backup
            return await this.createFullBackup();
        }
    }

    // Helper method to map database column names to Excel column names for loans
    mapLoanDbColumnToExcel(dbColumn) {
        const mapping = {
            'id': 'ID',
            'client_id': 'Client ID',
            'client_name': 'Client Name',
            'amount': 'Amount',
            'disbursement_date': 'Disbursement Date',
            'proof_file_name': 'Proof File',
            'created_at': 'Created At'
        };
        return mapping[dbColumn] || dbColumn;
    }

    // Helper method to map Excel column names to database column names for loans
    mapLoanExcelColumnToDb(excelColumn) {
        const mapping = {
            'ID': 'id',
            'Client ID': 'client_id',
            'Client Name': 'client_name',
            'Amount': 'amount',
            'Disbursement Date': 'disbursement_date',
            'Proof File': 'proof_file_name',
            'Created At': 'created_at'
        };
        return mapping[excelColumn] || excelColumn;
    }

    async updateBackupForFollowUp(followUpId, clientId, action) {
        try {
            const latestBackupPath = await this.getLatestBackup();

            if (!latestBackupPath) {
                // No existing backup, create a new one
                return await this.createFullBackup();
            }

            const workbook = new ExcelJS.Workbook();
            await workbook.xlsx.readFile(latestBackupPath);

            const followUpsSheet = workbook.getWorksheet('Follow-ups');

            // Get column indexes by header names
            const headerRow = followUpsSheet.getRow(1);
            const columnIndexes = {};
            headerRow.eachCell((cell, colNumber) => {
                columnIndexes[cell.value] = colNumber;
            });

            if (action === 'delete') {
                // Find and remove the follow-up row
                let rowToDelete = null;
                followUpsSheet.eachRow((row, rowNumber) => {
                    if (rowNumber > 1) { // Skip header row
                        const idCell = row.getCell(columnIndexes['ID']);
                        if (idCell && idCell.value === followUpId) {
                            rowToDelete = rowNumber;
                        }
                    }
                });

                if (rowToDelete) {
                    followUpsSheet.spliceRows(rowToDelete, 1);
                }
            } else {
                // Get updated follow-up data with client name
                const [followUps] = await pool.query(`
                SELECT f.*, c.customer_name as client_name
                FROM follow_ups f
                JOIN clients c ON f.client_id = c.id
                WHERE f.id = ?
            `, [followUpId]);

                if (followUps.length === 0) {
                    return latestBackupPath;
                }

                const followUp = followUps[0];

                // Format dates
                if (followUp.created_at) {
                    followUp.created_at = format(new Date(followUp.created_at), 'yyyy-MM-dd HH:mm:ss');
                }

                if (followUp.date) {
                    followUp.date = format(new Date(followUp.date), 'yyyy-MM-dd HH:mm:ss');
                }

                if (followUp.next_follow_up_date) {
                    followUp.next_follow_up_date = format(new Date(followUp.next_follow_up_date), 'yyyy-MM-dd');
                }

                // Convert boolean to Yes/No
                followUp.reminder_sent = followUp.reminder_sent ? 'Yes' : 'No';

                // Check if follow-up already exists in the sheet
                let existingRow = null;
                followUpsSheet.eachRow((row, rowNumber) => {
                    if (rowNumber > 1) { // Skip header row
                        const idCell = row.getCell(columnIndexes['ID']);
                        if (idCell && idCell.value === followUpId) {
                            existingRow = row;
                        }
                    }
                });

                if (existingRow) {
                    // Update existing row
                    Object.keys(followUp).forEach(key => {
                        // Map database column names to Excel column names
                        const excelColumnName = this.mapFollowUpDbColumnToExcel(key);
                        const columnIndex = columnIndexes[excelColumnName];

                        if (columnIndex) {
                            existingRow.getCell(columnIndex).value = followUp[key];
                        }
                    });
                } else {
                    // Add new row with data in the correct order
                    const rowData = [];
                    followUpsSheet.columns.forEach((column, index) => {
                        const dbColumnName = this.mapFollowUpExcelColumnToDb(column.header);
                        rowData.push(followUp[dbColumnName] || null);
                    });
                    followUpsSheet.addRow(rowData);
                }
            }

            // Save the updated workbook
            await workbook.xlsx.writeFile(latestBackupPath);
            return latestBackupPath;
        } catch (error) {
            console.error('Error updating backup for follow-up:', error);
            // If update fails, create a new full backup
            return await this.createFullBackup();
        }
    }

    // Helper method to map database column names to Excel column names for follow-ups
    mapFollowUpDbColumnToExcel(dbColumn) {
        const mapping = {
            'id': 'ID',
            'client_id': 'Client ID',
            'client_name': 'Client Name',
            'type': 'Type',
            'date': 'Date',
            'notes': 'Notes',
            'next_follow_up_date': 'Next Follow-up Date',
            'created_at': 'Created At',
            'reminder_sent': 'Reminder Sent'
        };
        return mapping[dbColumn] || dbColumn;
    }

    // Helper method to map Excel column names to database column names for follow-ups
    mapFollowUpExcelColumnToDb(excelColumn) {
        const mapping = {
            'ID': 'id',
            'Client ID': 'client_id',
            'Client Name': 'client_name',
            'Type': 'type',
            'Date': 'date',
            'Notes': 'notes',
            'Next Follow-up Date': 'next_follow_up_date',
            'Created At': 'created_at',
            'Reminder Sent': 'reminder_sent'
        };
        return mapping[excelColumn] || excelColumn;
    }

}

module.exports = new BackupService();