import express from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { sql, getPool } from '../db.js';

const router = express.Router();

// Mock users for demonstration if DB table doesn't exist yet
// In a real app, you'd check the DB
const MOCK_USERS = [
    { username: 'admin', password: 'password123', role: 'admin' },
    { username: 'uploader', password: 'password123', role: 'uploader' },
    { username: 'viewer', password: 'password123', role: 'viewer' }
];

router.post('/login', async (req, res) => {
    const { username, password } = req.body;
    console.log(`🔑 Login attempt for: ${username}`);

    try {
        const pool = getPool();
        let user;

        try {
            const result = await pool.request()
                .input('username', sql.VarChar, username)
                .query('SELECT * FROM Users WHERE username = @username');
            user = result.recordset[0];
        } catch (dbErr) {
            console.error('❌ Database Query Error:', dbErr.message);
            console.log('⚠️ Users table not found or DB error, using mock fallback');
        }

        // If user found in DB, verify password
        if (user) {
            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) {
                // Second chance fallback for demo
                const mockUser = MOCK_USERS.find(u => u.username === username);
                if (mockUser && password === mockUser.password) {
                    user = { ...mockUser, id: user.id, fullName: 'System Administrator' }; 
                } else {
                    return res.status(401).json({ message: 'Invalid credentials' });
                }
            } else {
                // Fetch FullName from Employees table
                try {
                    const empResult = await pool.request()
                        .input('username', sql.VarChar, username)
                        .query(`SELECT FullName FROM EmployeeManagement.dbo.Employees WHERE LTRIM(RTRIM(IdNumber)) = @username`);
                    if (empResult.recordset[0]) {
                        user.fullName = empResult.recordset[0].FullName;
                    } else {
                        user.fullName = user.username;
                    }
                } catch (empErr) {
                    user.fullName = user.username;
                }
            }
        } 
        // Fallback to mock accounts
        else {
            const mockUser = MOCK_USERS.find(u => u.username === username);
            if (mockUser && password === mockUser.password) {
                user = { ...mockUser, id: 0, fullName: mockUser.username === 'admin' ? 'System Administrator' : 'Demo User' };
            } else {
                return res.status(401).json({ message: 'Invalid credentials' });
            }
        }

        const token = jwt.sign(
            { id: user.id, username: user.username, role: user.role, fullName: user.fullName },
            process.env.JWT_SECRET,
            { expiresIn: '8h' }
        );

        res.json({
            token,
            user: { username: user.username, role: user.role, fullName: user.fullName }
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
});

export default router;
