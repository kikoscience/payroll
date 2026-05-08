import express from 'express';
import bcrypt from 'bcryptjs';
import { sql, getPool } from '../db.js';
import { authenticateToken, authorizeRoles } from '../middleware/auth.js';

const router = express.Router();

// GET all users - ADMIN ONLY
router.get('/', authenticateToken, authorizeRoles('admin'), async (req, res) => {
    try {
        const pool = getPool();
        const result = await pool.request().query('SELECT id, username, role FROM Users ORDER BY username ASC');
        res.json(result.recordset);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching users' });
    }
});

// CREATE user - ADMIN ONLY
router.post('/', authenticateToken, authorizeRoles('admin'), async (req, res) => {
    const { username, password, role } = req.body;
    try {
        const pool = getPool();
        const hashedPassword = await bcrypt.hash(password, 10);
        await pool.request()
            .input('username', sql.NVarChar, username)
            .input('password', sql.NVarChar, hashedPassword)
            .input('role', sql.NVarChar, role)
            .query('INSERT INTO Users (username, password, role) VALUES (@username, @password, @role)');
        res.status(201).json({ message: 'User created successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Error creating user (Username might already exist)' });
    }
});

// UPDATE user (Role or Password) - ADMIN ONLY
router.put('/:id', authenticateToken, authorizeRoles('admin'), async (req, res) => {
    const { id } = req.params;
    const { username, password, role } = req.body;
    try {
        const pool = getPool();
        let query = 'UPDATE Users SET username = @username, role = @role';
        const request = pool.request()
            .input('id', sql.Int, id)
            .input('username', sql.NVarChar, username)
            .input('role', sql.NVarChar, role);

        if (password) {
            const hashedPassword = await bcrypt.hash(password, 10);
            request.input('password', sql.NVarChar, hashedPassword);
            query += ', password = @password';
        }

        query += ' WHERE id = @id';
        await request.query(query);
        res.json({ message: 'User updated successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Error updating user' });
    }
});

// DELETE user - ADMIN ONLY
router.delete('/:id', authenticateToken, authorizeRoles('admin'), async (req, res) => {
    const { id } = req.params;
    try {
        const pool = getPool();
        await pool.request().input('id', sql.Int, id).query('DELETE FROM Users WHERE id = @id');
        res.json({ message: 'User deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Error deleting user' });
    }
});

export default router;
