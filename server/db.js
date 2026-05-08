import sql from 'mssql';
import dotenv from 'dotenv';

dotenv.config();

const config = {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    server: process.env.DB_SERVER,
    database: process.env.DB_DATABASE,
    options: {
        encrypt: true,
        trustServerCertificate: process.env.DB_TRUST_SERVER_CERTIFICATE === 'true'
    }
};

let pool;

export const connectDB = async () => {
    try {
        console.log(`📡 Attempting to connect to MSSQL at ${config.server}...`);
        pool = await sql.connect(config);
        // Initialize Enterprise Tables
        await pool.request().query(`
            IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'AuditLogs')
            CREATE TABLE AuditLogs (
                id INT PRIMARY KEY IDENTITY(1,1),
                userId INT NOT NULL,
                username NVARCHAR(100),
                action NVARCHAR(100) NOT NULL,
                details NVARCHAR(MAX),
                ipAddress NVARCHAR(50),
                timestamp DATETIME DEFAULT GETDATE()
            );

            IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Broadcasts')
            BEGIN
                CREATE TABLE Broadcasts (
                    id INT PRIMARY KEY IDENTITY(1,1),
                    title NVARCHAR(200) NOT NULL,
                    message NVARCHAR(MAX) NOT NULL,
                    type NVARCHAR(50) DEFAULT 'info',
                    authorId INT,
                    createdAt DATETIME DEFAULT GETDATE(),
                    expiresAt DATETIME
                );
                INSERT INTO Broadcasts (title, message, type) 
                VALUES ('System Upgrade Successful', 'We have implemented new enterprise-grade security and transparency features.', 'success');
            END
        `);
        console.log('🏛️ Enterprise Tables Verified');
        
        return pool;
    } catch (err) {
        console.error('❌ Database Connection Failed!');
        console.error('Error Code:', err.code);
        console.error('Error Message:', err.message);
        console.error('Technical Details:', err.originalError?.info?.message || 'N/A');
        
        if (err.message.includes('Login failed')) {
            console.error('💡 TIP: Check if "sa" account is enabled and the password is correct.');
        }

        if (err.message.toLowerCase().includes('database') && err.message.toLowerCase().includes('does not exist')) {
            console.error(`💡 TIP: The database "${process.env.DB_DATABASE}" does not exist. Please create it on your SQL Server.`);
        }
        
        process.exit(1);
    }
};

export { sql };
export const getPool = () => pool;
