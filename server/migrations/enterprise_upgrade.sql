-- ENTERPRISE SUITE MIGRATIONS

-- 1. Audit Logs Table
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'AuditLogs')
BEGIN
    CREATE TABLE AuditLogs (
        id INT PRIMARY KEY IDENTITY(1,1),
        userId INT NOT NULL,
        username NVARCHAR(100),
        action NVARCHAR(100) NOT NULL, -- e.g., 'UPLOAD_BATCH', 'DELETE_USER'
        details NVARCHAR(MAX),
        ipAddress NVARCHAR(50),
        timestamp DATETIME DEFAULT GETDATE()
    );
END

-- 2. Broadcasts / Announcements Table
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Broadcasts')
BEGIN
    CREATE TABLE Broadcasts (
        id INT PRIMARY KEY IDENTITY(1,1),
        title NVARCHAR(200) NOT NULL,
        message NVARCHAR(MAX) NOT NULL,
        type NVARCHAR(50) DEFAULT 'info', -- 'info', 'warning', 'success'
        authorId INT,
        createdAt DATETIME DEFAULT GETDATE(),
        expiresAt DATETIME
    );
    
    -- Insert a welcome message
    INSERT INTO Broadcasts (title, message, type) 
    VALUES ('Welcome to the New Portal', 'We have upgraded the payroll system to provide more transparency and mobile access for all CDH employees.', 'success');
END
