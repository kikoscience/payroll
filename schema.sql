-- Create Database
-- CREATE DATABASE EmployeeManagement;
-- GO

-- USE EmployeeManagement;
-- GO

-- Users Table
CREATE TABLE Users (
    id INT PRIMARY KEY IDENTITY(1,1),
    username NVARCHAR(50) UNIQUE NOT NULL,
    password NVARCHAR(255) NOT NULL,
    role NVARCHAR(20) NOT NULL -- 'admin', 'uploader', 'viewer'
);

-- Tasks Table
CREATE TABLE Tasks (
    id INT PRIMARY KEY IDENTITY(1,1),
    title NVARCHAR(100) NOT NULL,
    description NVARCHAR(MAX),
    amount DECIMAL(10, 2),
    status NVARCHAR(20) DEFAULT 'active', -- 'active', 'disabled'
    createdBy NVARCHAR(50),
    createdAt DATETIME DEFAULT GETDATE()
);

-- Employees Table
CREATE TABLE Employees (
    id INT PRIMARY KEY IDENTITY(1,1),
    employeeId NVARCHAR(20) UNIQUE NOT NULL,
    firstName NVARCHAR(50) NOT NULL,
    lastName NVARCHAR(50) NOT NULL,
    department NVARCHAR(50),
    position NVARCHAR(50),
    status NVARCHAR(20) DEFAULT 'active', -- 'active', 'disabled'
    createdAt DATETIME DEFAULT GETDATE()
);

-- Payroll Batches Table
CREATE TABLE PayrollBatches (
    id INT PRIMARY KEY IDENTITY(1,1),
    batchName NVARCHAR(100) NOT NULL,
    period NVARCHAR(50) NOT NULL,
    totalAmount DECIMAL(18, 2),
    recordCount INT,
    uploadDate DATETIME DEFAULT GETDATE(),
    status NVARCHAR(20) DEFAULT 'posted'
);

-- Batch Labels Configuration
CREATE TABLE BatchLabels (
    id INT PRIMARY KEY IDENTITY(1,1),
    label NVARCHAR(100) NOT NULL,
    status NVARCHAR(20) DEFAULT 'active'
);

-- Payslips Table (Updated with BatchId)
CREATE TABLE Payslips (
    id INT PRIMARY KEY IDENTITY(1,1),
    batchId INT FOREIGN KEY REFERENCES PayrollBatches(id),
    IdNumber NVARCHAR(50),
    FullName NVARCHAR(255),
    
    -- Earnings / Base
    salaries_si DECIMAL(18,2) DEFAULT 0,
    due_to_others_earnings DECIMAL(18,2) DEFAULT 0,
    absences DECIMAL(18,2) DEFAULT 0,
    pera DECIMAL(18,2) DEFAULT 0,
    sa DECIMAL(18,2) DEFAULT 0,
    la DECIMAL(18,2) DEFAULT 0,
    hazard_pay DECIMAL(18,2) DEFAULT 0,
    night_shift_differential DECIMAL(18,2) DEFAULT 0,
    amount DECIMAL(18,2) DEFAULT 0, -- This is Gross Amount

    -- Deductions
    tax DECIMAL(18,2) DEFAULT 0, -- This is due_to_bir
    gsis_ps DECIMAL(18,2) DEFAULT 0,
    gsis_conso_loan DECIMAL(18,2) DEFAULT 0,
    gsis_eml DECIMAL(18,2) DEFAULT 0,
    gsis_policy_loan DECIMAL(18,2) DEFAULT 0,
    gfal DECIMAL(18,2) DEFAULT 0,
    gsis_mpl DECIMAL(18,2) DEFAULT 0,
    gsis_mpl_lite DECIMAL(18,2) DEFAULT 0,
    gsis_cpl DECIMAL(18,2) DEFAULT 0,
    pagibig_ps DECIMAL(18,2) DEFAULT 0,
    pagibig_mp2 DECIMAL(18,2) DEFAULT 0,
    pagibig_mpl DECIMAL(18,2) DEFAULT 0,
    pagibig_cal DECIMAL(18,2) DEFAULT 0,
    phic_ps DECIMAL(18,2) DEFAULT 0,
    lbp DECIMAL(18,2) DEFAULT 0,
    due_from_others DECIMAL(18,2) DEFAULT 0,
    voluntaryDeductions DECIMAL(18,2) DEFAULT 0, -- This is total_deductions
    
    -- Final
    netAmountDue DECIMAL(18,2) DEFAULT 0, -- This is net_amount
    
    description NVARCHAR(MAX),
    uploadDate DATETIME DEFAULT GETDATE(),
    status NVARCHAR(20) DEFAULT 'active'
);
