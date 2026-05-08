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
    IdNumber NVARCHAR(20) NOT NULL,
    batchId INT, -- Links to PayrollBatches
    payslipType NVARCHAR(50) NOT NULL, 
    subType NVARCHAR(100), -- PhilHealth Sharing, Honoraria, etc.
    period NVARCHAR(50), 
    amount DECIMAL(18, 2),
    tax DECIMAL(18, 2) DEFAULT 0,
    voluntaryDeductions DECIMAL(18, 2) DEFAULT 0,
    netAmountDue DECIMAL(18, 2),
    description NVARCHAR(MAX),
    uploadDate DATETIME DEFAULT GETDATE(),
    status NVARCHAR(20) DEFAULT 'active'
);
