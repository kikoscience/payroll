import express from 'express';
import { sql, getPool } from '../db.js';
import { authenticateToken, authorizeRoles } from '../middleware/auth.js';

const router = express.Router();

// GET all tasks - Accessible by all roles
router.get('/', authenticateToken, async (req, res) => {
    try {
        const pool = getPool();
        const result = await pool.request().query('SELECT * FROM Tasks ORDER BY createdAt DESC');
        res.json(result.recordset);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching tasks' });
    }
});

// CREATE task - Admin and Uploader
router.post('/', authenticateToken, authorizeRoles('admin', 'uploader'), async (req, res) => {
    const { title, description, amount, status } = req.body;
    try {
        const pool = getPool();
        await pool.request()
            .input('title', sql.VarChar, title)
            .input('description', sql.VarChar, description)
            .input('amount', sql.Decimal(10, 2), amount)
            .input('status', sql.VarChar, status || 'active')
            .input('createdBy', sql.VarChar, req.user.username)
            .query('INSERT INTO Tasks (title, description, amount, status, createdBy, createdAt) VALUES (@title, @description, @amount, @status, @createdBy, GETDATE())');
        
        res.status(201).json({ message: 'Task created successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Error creating task' });
    }
});

// UPDATE task - Admin and Uploader
router.put('/:id', authenticateToken, authorizeRoles('admin', 'uploader'), async (req, res) => {
    const { id } = req.params;
    const { title, description, amount, status } = req.body;
    try {
        const pool = getPool();
        await pool.request()
            .input('id', sql.Int, id)
            .input('title', sql.VarChar, title)
            .input('description', sql.VarChar, description)
            .input('amount', sql.Decimal(10, 2), amount)
            .input('status', sql.VarChar, status)
            .query('UPDATE Tasks SET title = @title, description = @description, amount = @amount, status = @status WHERE id = @id');
        
        res.json({ message: 'Task updated successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Error updating task' });
    }
});

// DELETE task - Admin only
router.delete('/:id', authenticateToken, authorizeRoles('admin'), async (req, res) => {
    const { id } = req.params;
    try {
        const pool = getPool();
        await pool.request()
            .input('id', sql.Int, id)
            .query('DELETE FROM Tasks WHERE id = @id');
        
        res.json({ message: 'Task deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Error deleting task' });
    }
});

// DISABLE/ENABLE task - Admin and Uploader (as requested "add disable aswell")
router.patch('/:id/status', authenticateToken, authorizeRoles('admin', 'uploader'), async (req, res) => {
    const { id } = req.params;
    const { status } = req.body; // 'disabled' or 'active'
    try {
        const pool = getPool();
        await pool.request()
            .input('id', sql.Int, id)
            .input('status', sql.VarChar, status)
            .query('UPDATE Tasks SET status = @status WHERE id = @id');
        
        res.json({ message: `Task status updated to ${status}` });
    } catch (err) {
        res.status(500).json({ message: 'Error updating task status' });
    }
});

export default router;
