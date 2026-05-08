import express from 'express';
import { sql, getPool } from '../db.js';
import { authenticateToken, authorizeRoles } from '../middleware/auth.js';

const router = express.Router();

// GET all active labels
router.get('/', authenticateToken, async (req, res) => {
    try {
        const pool = getPool();
        // Check if table exists first (Auto-fix for Docker)
        await pool.request().query(`
            IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'BatchLabels')
            BEGIN
                CREATE TABLE BatchLabels (
                    id INT PRIMARY KEY IDENTITY(1,1),
                    label NVARCHAR(100) NOT NULL,
                    status NVARCHAR(20) DEFAULT 'active'
                );
                INSERT INTO BatchLabels (label, status) VALUES ('Monthly Salary', 'active');
                INSERT INTO BatchLabels (label, status) VALUES ('PhilHealth Sharing', 'active');
            END
        `);

        const result = await pool.request().query('SELECT * FROM BatchLabels ORDER BY label ASC');
        res.json(result.recordset);
    } catch (err) {
        console.error('BatchLabel GET Error:', err.message);
        res.status(500).json({ message: err.message });
    }
});

// CREATE label
router.post('/', authenticateToken, authorizeRoles('admin', 'uploader'), async (req, res) => {
    const { label } = req.body;
    if (!label) return res.status(400).json({ message: 'Label is required' });

    try {
        const pool = getPool();
        await pool.request()
            .input('label', sql.NVarChar, label)
            .query("INSERT INTO BatchLabels (label, status) VALUES (@label, 'active')");
        res.status(201).json({ message: 'Created' });
    } catch (err) {
        console.error('BatchLabel POST Error:', err.message);
        res.status(500).json({ message: err.message });
    }
});

// UPDATE label or status
router.patch('/:id', authenticateToken, authorizeRoles('admin', 'uploader'), async (req, res) => {
    const { label, status } = req.body;
    try {
        const pool = getPool();
        if (label) {
            await pool.request()
                .input('id', sql.Int, req.params.id)
                .input('label', sql.NVarChar, label)
                .query('UPDATE BatchLabels SET label = @label WHERE id = @id');
        }
        if (status) {
            await pool.request()
                .input('id', sql.Int, req.params.id)
                .input('status', sql.VarChar, status)
                .query('UPDATE BatchLabels SET status = @status WHERE id = @id');
        }
        res.json({ message: 'Updated' });
    } catch (err) {
        console.error('BatchLabel PATCH Error:', err.message);
        res.status(500).json({ message: err.message });
    }
});

// DELETE label
router.delete('/:id', authenticateToken, authorizeRoles('admin', 'uploader'), async (req, res) => {
    try {
        const pool = getPool();
        await pool.request()
            .input('id', sql.Int, req.params.id)
            .query('DELETE FROM BatchLabels WHERE id = @id');
        res.json({ message: 'Deleted' });
    } catch (err) {
        console.error('BatchLabel DELETE Error:', err.message);
        res.status(500).json({ message: err.message });
    }
});

export default router;
