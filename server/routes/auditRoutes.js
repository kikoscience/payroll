import express from 'express';
import { sql, getPool } from '../db.js';
import { authenticateToken, authorizeRoles } from '../middleware/auth.js';

const router = express.Router();

// GET all audit logs - ADMIN ONLY
router.get('/', authenticateToken, authorizeRoles('admin'), async (req, res) => {
    try {
        const pool = getPool();
        const result = await pool.request().query('SELECT TOP 1000 * FROM AuditLogs ORDER BY timestamp DESC');
        res.json(result.recordset);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching audit logs' });
    }
});

export default router;
