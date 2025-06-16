
CREATE DATABASE IF NOT EXISTS cbs_db;
USE cbs_db;

CREATE TABLE clients (
    id INT PRIMARY KEY AUTO_INCREMENT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    customer_name VARCHAR(255) NOT NULL,
    phone_number VARCHAR(20) NOT NULL,
    business_name VARCHAR(255) NOT NULL,
    monthly_turnover DECIMAL(15,2),
    area VARCHAR(255) NOT NULL,
    required_amount DECIMAL(15,2) NOT NULL,
    old_financier_name VARCHAR(255),
    old_scheme VARCHAR(255),
    old_finance_amount DECIMAL(15,2),
    new_financier_name VARCHAR(255),
    new_scheme VARCHAR(255),
    bank_support BOOLEAN DEFAULT FALSE,
    remarks TEXT,
    reference VARCHAR(255),
    status ENUM('New', 'In Progress', 'Approved', 'Rejected', 'Disbursed', 'Completed') DEFAULT 'New',
    commission_percentage DECIMAL(5,2),
    disbursement_date DATE,
    last_follow_up TIMESTAMP,
    next_follow_up TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_status (status)
);

CREATE TABLE follow_ups (
    id INT PRIMARY KEY AUTO_INCREMENT,
    client_id INT NOT NULL,
    date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    type Text,
    notes TEXT,
    next_follow_up_date TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
-- Modify the clients table
ALTER TABLE clients
MODIFY COLUMN last_follow_up DATETIME NULL,
MODIFY COLUMN next_follow_up DATETIME NULL,
MODIFY COLUMN updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;

-- Modify the follow_ups table
ALTER TABLE follow_ups
MODIFY COLUMN date DATETIME NOT NULL,
MODIFY COLUMN next_follow_up_date DATETIME NULL,
MODIFY COLUMN created_at DATETIME DEFAULT CURRENT_TIMESTAMP;

-- Add indexes for better performance
ALTER TABLE follow_ups
ADD INDEX idx_client_date (client_id, date);

CREATE TABLE loans (
    id INT PRIMARY KEY AUTO_INCREMENT,
    client_id INT NOT NULL,
    amount DECIMAL(15,2) NOT NULL,
    disbursement_date DATE NOT NULL,
    proof_file_name VARCHAR(255),
    proof_file_path VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


CREATE TABLE documents (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    folder VARCHAR(255) NOT NULL,
    size BIGINT NOT NULL,
    type VARCHAR(100) NOT NULL,
    file_path VARCHAR(255) NOT NULL,
    original_name VARCHAR(255) NOT NULL,
    upload_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE folders (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default folders
INSERT INTO folders (name) VALUES 
    ('General'),
    ('Loan Documents'),
    ('Client References'),
    ('ID Proofs');


-- Add reminder_sent column to follow_ups table
ALTER TABLE cbs_db.follow_ups ADD COLUMN reminder_sent BOOLEAN DEFAULT FALSE;
