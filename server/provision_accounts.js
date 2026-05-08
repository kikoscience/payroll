import { sql, getPool, connectDB } from './db.js';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

const EMP_TABLE = 'EmployeeManagement.dbo.Employees';

async function provisionAccounts() {
    console.log('🚀 Starting Bulk Account Provisioning...');
    
    try {
        await connectDB();
        const pool = getPool();

        // 1. Get all employees
        console.log('--- Fetching Employees ---');
        const empResult = await pool.request().query(`SELECT IdNumber, DateOfBirth FROM ${EMP_TABLE}`);
        const employees = empResult.recordset;
        console.log(`Found ${employees.length} employees in registry.`);

        // 2. Get existing users to avoid duplicates
        const userResult = await pool.request().query('SELECT username FROM Users');
        const existingUsernames = new Set(userResult.recordset.map(u => u.username.toLowerCase().trim()));

        let createdCount = 0;
        let skippedCount = 0;
        let errorCount = 0;

        for (const emp of employees) {
            const username = String(emp.IdNumber || '').trim();
            if (!username) {
                skippedCount++;
                continue;
            }

            // Skip if user already exists
            if (existingUsernames.has(username.toLowerCase())) {
                skippedCount++;
                continue;
            }

            if (!emp.DateOfBirth) {
                console.warn(`⚠️ Skipping ${username}: No Birthdate found.`);
                skippedCount++;
                continue;
            }

            try {
                // Format DOB as YYYYMMDD
                const dob = new Date(emp.DateOfBirth);
                const passwordRaw = dob.getFullYear().toString() + 
                                   (dob.getMonth() + 1).toString().padStart(2, '0') + 
                                   dob.getDate().toString().padStart(2, '0');
                
                const hashedPassword = await bcrypt.hash(passwordRaw, 10);

                await pool.request()
                    .input('username', sql.NVarChar, username)
                    .input('password', sql.NVarChar, hashedPassword)
                    .input('role', sql.NVarChar, 'viewer')
                    .query('INSERT INTO Users (username, password, role) VALUES (@username, @password, @role)');
                
                createdCount++;
                if (createdCount % 10 === 0) console.log(`Processed ${createdCount} accounts...`);
            } catch (err) {
                console.error(`❌ Error creating account for ${username}:`, err.message);
                errorCount++;
            }
        }

        console.log('\n--- Provisioning Summary ---');
        console.log(`✅ Accounts Created: ${createdCount}`);
        console.log(`⏩ Skipped (Already Exist/No DOB): ${skippedCount}`);
        console.log(`❌ Errors: ${errorCount}`);
        console.log('----------------------------\n');

    } catch (err) {
        console.error('💥 Fatal Error:', err.message);
    } finally {
        process.exit();
    }
}

provisionAccounts();
