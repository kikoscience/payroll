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
        console.log('✅ Connected to MSSQL Database');
        
        // Optional: Check if the specific database exists or switch to it
        if (process.env.DB_DATABASE !== 'master') {
            console.log(`📂 Using database: ${process.env.DB_DATABASE}`);
        }
        
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
