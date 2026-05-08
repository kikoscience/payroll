import express from 'express';
import { sql, getPool } from '../db.js';
import { authenticateToken, authorizeRoles } from '../middleware/auth.js';

const router = express.Router();

// GET active broadcasts
router.get('/', authenticateToken, async (req, res) => {
    try {
        const pool = getPool();
        const result = await pool.request().query('SELECT * FROM Broadcasts ORDER BY createdAt DESC');
        res.json(result.recordset);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching broadcasts' });
    }
});

// CREATE broadcast - ADMIN ONLY
router.post('/', authenticateToken, authorizeRoles('admin'), async (req, res) => {
    const { title, message, type } = req.body;
    try {
        const pool = getPool();
        await pool.request()
            .input('title', sql.NVarChar, title)
            .input('message', sql.NVarChar, message)
            .input('type', sql.NVarChar, type || 'info')
            .input('authorId', sql.Int, req.user.id)
            .query(`
                INSERT INTO Broadcasts (title, message, type, authorId)
                VALUES (@title, @message, @type, @authorId)
            `);
        res.status(201).json({ message: 'Broadcast posted' });
    } catch (err) {
        res.status(500).json({ message: 'Error posting broadcast' });
    }
});

// DELETE broadcast - ADMIN ONLY
router.delete('/:id', authenticateToken, authorizeRoles('admin'), async (req, res) => {
    try {
        const pool = getPool();
        await pool.request()
            .input('id', sql.Int, req.params.id)
            .query('DELETE FROM Broadcasts WHERE id = @id');
        res.json({ message: 'Deleted' });
    } catch (err) {
        res.status(500).json({ message: 'Error deleting broadcast' });
    }
});

export default router;
