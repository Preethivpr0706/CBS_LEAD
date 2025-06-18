// services/reminderService.js
const nodemailer = require('nodemailer');
const pool = require('../config/database');

// Since your dates are already stored correctly with IST timezone adjustment,
// we need to work with the same timezone for comparison
const getCurrentMySQLDateTime = () => {
    const now = new Date();
    // Add 5:30 hours to match how you store dates in DB
    const adjustedTime = new Date(now.getTime() + (5.5 * 60 * 60 * 1000));
    return adjustedTime.toISOString().slice(0, 19).replace('T', ' ');
};

const addHoursToCurrentTime = (hours) => {
    const now = new Date();
    // Add 5:30 hours to match your DB timezone, then add the specified hours
    const adjustedTime = new Date(now.getTime() + (5.5 * 60 * 60 * 1000));
    const futureTime = new Date(adjustedTime.getTime() + (hours * 60 * 60 * 1000));
    return futureTime.toISOString().slice(0, 19).replace('T', ' ');
};

// Get settings from database
const getSettings = async() => {
    try {
        const [settings] = await pool.query('SELECT * FROM company_settings WHERE id = 1');
        return settings[0] || {
            company_name: 'Chetana Business Solutions',
            notification_email: 'harishradhakrishnan2001@gmail.com',
            reminder_time_before: 2,
            notifications_enabled: true
        };
    } catch (error) {
        console.error('Error fetching settings:', error);
        // Return default settings if there's an error
        return {
            company_name: 'Chetana Business Solutions',
            notification_email: 'harishradhakrishnan2001@gmail.com',
            reminder_time_before: 2,
            notifications_enabled: true
        };
    }
};

// Configure Nodemailer with settings from environment variables or use defaults
const createTransporter = async() => {
    // You could store these in environment variables for better security
    const emailUser = process.env.EMAIL_USER || 'preethivijay0706@gmail.com';
    const emailPass = process.env.EMAIL_PASS || 'otvl xydr tqlm tkfd';

    return nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        auth: {
            user: emailUser,
            pass: emailPass
        }
    });
};

const sendFollowUpReminder = async(followUp, client, settings) => {
    try {
        console.log('Sending reminder for:', followUp);
        console.log('Client details:', client);

        // Create transporter
        const transporter = await createTransporter();

        // Get notification email from settings
        const notificationEmail = settings.notification_email;

        // Format dates for better readability
        const followUpDate = new Date(followUp.date).toLocaleString('en-IN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });

        const nextFollowUpDate = new Date(followUp.next_follow_up_date).toLocaleString('en-IN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });

        const mailOptions = {
            from: process.env.EMAIL_USER || 'preethivijay0706@gmail.com',
            to: notificationEmail,
            subject: `Follow-up Reminder: ${client.customer_name} - ${client.business_name}`,
            html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
                <h2 style="color: #3b82f6; margin-top: 0;">Follow-up Reminder</h2>
                
                <div style="background-color: #f0f9ff; border-left: 4px solid #3b82f6; padding: 15px; margin-bottom: 20px;">
                    <p style="margin: 0; font-weight: bold;">A follow-up is due in ${settings.reminder_time_before} hours!</p>
                </div>
                
                <h3 style="margin-bottom: 10px;">Client Details:</h3>
                <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
                    <tr>
                        <td style="padding: 8px; border-bottom: 1px solid #e0e0e0; font-weight: bold; width: 150px;">Client Name:</td>
                        <td style="padding: 8px; border-bottom: 1px solid #e0e0e0;">${client.customer_name}</td>
                    </tr>
                    <tr>
                        <td style="padding: 8px; border-bottom: 1px solid #e0e0e0; font-weight: bold;">Business:</td>
                        <td style="padding: 8px; border-bottom: 1px solid #e0e0e0;">${client.business_name}</td>
                    </tr>
                    <tr>
                        <td style="padding: 8px; border-bottom: 1px solid #e0e0e0; font-weight: bold;">Phone:</td>
                        <td style="padding: 8px; border-bottom: 1px solid #e0e0e0;">${client.phone_number}</td>
                    </tr>
                    <tr>
                        <td style="padding: 8px; border-bottom: 1px solid #e0e0e0; font-weight: bold;">Area:</td>
                        <td style="padding: 8px; border-bottom: 1px solid #e0e0e0;">${client.area}</td>
                    </tr>
                    <tr>
                        <td style="padding: 8px; border-bottom: 1px solid #e0e0e0; font-weight: bold;">Status:</td>
                        <td style="padding: 8px; border-bottom: 1px solid #e0e0e0;">${client.status}</td>
                    </tr>
                </table>
                
                <h3 style="margin-bottom: 10px;">Follow-up Details:</h3>
                <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
                    <tr>
                        <td style="padding: 8px; border-bottom: 1px solid #e0e0e0; font-weight: bold; width: 150px;">Type:</td>
                        <td style="padding: 8px; border-bottom: 1px solid #e0e0e0;">${followUp.type}</td>
                    </tr>
                    <tr>
                        <td style="padding: 8px; border-bottom: 1px solid #e0e0e0; font-weight: bold;">Last Follow-up:</td>
                        <td style="padding: 8px; border-bottom: 1px solid #e0e0e0;">${followUpDate}</td>
                    </tr>
                    <tr>
                        <td style="padding: 8px; border-bottom: 1px solid #e0e0e0; font-weight: bold;">Next Follow-up:</td>
                        <td style="padding: 8px; border-bottom: 1px solid #e0e0e0; color: #dc2626;"><strong>${nextFollowUpDate}</strong></td>
                    </tr>
                    <tr>
                        <td style="padding: 8px; border-bottom: 1px solid #e0e0e0; font-weight: bold;">Notes:</td>
                        <td style="padding: 8px; border-bottom: 1px solid #e0e0e0;">${followUp.notes || 'No notes'}</td>
                    </tr>
                </table>
                
                <div style="background-color: #f0f9ff; padding: 15px; border-radius: 5px;">
                    <p style="margin: 0;">
                        <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/clients/${client.client_id}" 
                           style="color: #3b82f6; text-decoration: none; font-weight: bold;">
                            View Client Details →
                        </a>
                    </p>
                </div>
                
                <p style="color: #6b7280; font-size: 12px; margin-top: 20px; text-align: center;">
                    This is an automated reminder from ${settings.company_name}.
                </p>
            </div>
            `
        };

        await transporter.sendMail(mailOptions);
        console.log(`Reminder email sent to ${notificationEmail} for client: ${client.customer_name}`);
        return true;
    } catch (error) {
        console.error('Error sending reminder email:', error);
        return false;
    }
};

const checkFollowUpReminders = async() => {
    try {
        // Get settings from database
        const settings = await getSettings();



        const currentTime = getCurrentMySQLDateTime();
        const reminderHours = settings.reminder_time_before || 2; // Default to 2 hours if not set
        const futureTime = addHoursToCurrentTime(reminderHours);

        console.log(`Current Time (matching DB timezone): ${currentTime}`);
        console.log(`Looking ahead ${reminderHours} hours to: ${futureTime}`);

        // Updated query to find follow-ups that are:
        // 1. Scheduled between now and X hours from now (based on settings)
        // 2. Haven't had reminder sent yet
        const [followUps] = await pool.query(
            `SELECT f.*, 
                    c.customer_name, c.business_name, c.phone_number, c.area, c.status, c.id as client_id
             FROM follow_ups f
             INNER JOIN clients c ON f.client_id = c.id
             WHERE f.next_follow_up_date > ? 
               AND f.next_follow_up_date <= ?
               AND f.reminder_sent = 0`, [currentTime, futureTime]
        );

        console.log(`Found ${followUps.length} follow-ups due in the next ${reminderHours} hours`);

        // Debug: Show the follow-ups found
        followUps.forEach(followUp => {
            console.log(`Follow-up ID: ${followUp.id}, Client: ${followUp.customer_name}, Next follow-up: ${followUp.next_follow_up_date}`);
        });

        for (const followUp of followUps) {
            const success = await sendFollowUpReminder(followUp, followUp, settings);

            if (success) {
                await pool.query(
                    'UPDATE follow_ups SET reminder_sent = 1 WHERE id = ?', [followUp.id]
                );
                console.log(`Marked reminder as sent for follow-up ID: ${followUp.id}`);
            }
        }
    } catch (error) {
        console.error('Error checking follow-up reminders:', error);
    }
};

// Test function to check what's in the database
const debugFollowUps = async() => {
    try {
        // Get settings from database
        const settings = await getSettings();
        console.log('Settings:', settings);

        const currentTime = getCurrentMySQLDateTime();
        const reminderHours = settings.reminder_time_before || 2;
        const futureTime = addHoursToCurrentTime(reminderHours);

        console.log('=== DEBUG FOLLOW-UPS ===');
        console.log('Current Time (matching DB timezone):', currentTime);
        console.log(`Looking ahead ${reminderHours} hours to:`, futureTime);
        console.log('Notifications enabled:', settings.notifications_enabled ? 'Yes' : 'No');

        // Get all follow-ups for debugging
        const [allFollowUps] = await pool.query(
            `SELECT f.*, c.customer_name, c.business_name 
             FROM follow_ups f
             INNER JOIN clients c ON f.client_id = c.id
             ORDER BY f.next_follow_up_date`
        );

        console.log('\nAll follow-ups:');
        allFollowUps.forEach(followUp => {
            console.log(`ID: ${followUp.id}, Client: ${followUp.customer_name}, Next: ${followUp.next_follow_up_date}, Reminder Sent: ${followUp.reminder_sent}`);
        });

        // Check follow-ups in the time window
        const [windowFollowUps] = await pool.query(
            `SELECT f.*, c.customer_name, c.business_name 
             FROM follow_ups f
             INNER JOIN clients c ON f.client_id = c.id
             WHERE f.next_follow_up_date > ? 
               AND f.next_follow_up_date <= ?`, [currentTime, futureTime]
        );

        console.log(`\nFollow-ups in ${reminderHours}-hour window:`);
        windowFollowUps.forEach(followUp => {
            console.log(`ID: ${followUp.id}, Client: ${followUp.customer_name}, Next: ${followUp.next_follow_up_date}, Reminder Sent: ${followUp.reminder_sent}`);
        });

    } catch (error) {
        console.error('Error in debug function:', error);
    }
};

const runReminderCheck = async() => {
    console.log('Manually running follow-up reminder check...');
    await debugFollowUps(); // Add debug info
    await checkFollowUpReminders();
    console.log('Reminder check completed');
};

module.exports = {
    checkFollowUpReminders,
    runReminderCheck,
    debugFollowUps
};