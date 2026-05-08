import express from 'express';
import { sql, getPool } from '../db.js';
import { authenticateToken, authorizeRoles } from '../middleware/auth.js';

const router = express.Router();
const EMP_TABLE = 'EmployeeManagement.dbo.Employees';

// GET all Batches (Filtered by type)
router.get('/batches', authenticateToken, async (req, res) => {
    const { type } = req.query; // 'Payroll' or 'Other Receivables'
    try {
        const pool = getPool();
        let query = 'SELECT * FROM PayrollBatches';
        if (type) query += ' WHERE batchType = @type';
        query += ' ORDER BY uploadDate DESC';
        
        const result = await pool.request()
            .input('type', sql.VarChar, type)
            .query(query);
        res.json(result.recordset);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching batches' });
    }
});

// GET all payslips (With filtering)
router.get('/', authenticateToken, async (req, res) => {
    const { type, search, batchId } = req.query;
    try {
        const pool = getPool();
        let query = `
            SELECT p.*, e.FullName 
            FROM Payslips p
            LEFT JOIN ${EMP_TABLE} e ON p.IdNumber = e.IdNumber
            WHERE (e.FullName LIKE @search OR p.IdNumber LIKE @search)
        `;
        if (type) query += ` AND p.payslipType = @type`;
        if (batchId) query += ` AND p.batchId = @batchId`;
        query += ` ORDER BY p.uploadDate DESC`;

        const result = await pool.request()
            .input('search', sql.VarChar, `%${search || ''}%`)
            .input('type', sql.VarChar, type)
            .input('batchId', sql.Int, batchId)
            .query(query);
        res.json(result.recordset);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching' });
    }
});

// BULK UPLOAD (With Batching for both types)
router.post('/bulk', authenticateToken, authorizeRoles('admin', 'uploader'), async (req, res) => {
    const { payslips, batchName, period, globalType, globalSubType } = req.body;
    if (!payslips || !Array.isArray(payslips) || payslips.length === 0) {
        return res.status(400).json({ message: 'No data' });
    }

    try {
        const pool = getPool();
        
        // Ensure table has batchType column
        await pool.request().query(`
            IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('PayrollBatches') AND name = 'batchType')
            BEGIN
                ALTER TABLE PayrollBatches ADD batchType NVARCHAR(50) DEFAULT 'Payroll';
            END
        `);

        const transaction = new sql.Transaction(pool);
        await transaction.begin();
        
        try {
            const totalAmount = payslips.reduce((sum, p) => sum + (parseFloat(p.netAmountDue) || 0), 0);
            const finalBatchName = globalType === 'Payroll' ? (batchName || 'Monthly Salary') : (globalSubType || 'Other Receivable Batch');
            
            const batchResult = await transaction.request()
                .input('batchName', sql.NVarChar, finalBatchName)
                .input('period', sql.VarChar, period)
                .input('batchType', sql.VarChar, globalType)
                .input('totalAmount', sql.Decimal(18, 2), totalAmount)
                .input('recordCount', sql.Int, payslips.length)
                .query(`INSERT INTO PayrollBatches (batchName, period, batchType, totalAmount, recordCount, uploadDate, status) 
                        OUTPUT INSERTED.id VALUES (@batchName, @period, @batchType, @totalAmount, @recordCount, GETDATE(), 'posted')`);
            const batchId = batchResult.recordset[0].id;

            for (const p of payslips) {
                if (!p.IdNumber) continue;
                await transaction.request()
                    .input('IdNumber', sql.VarChar, p.IdNumber)
                    .input('batchId', sql.Int, batchId)
                    .input('payslipType', sql.VarChar, globalType || 'Other Receivables')
                    .input('subType', sql.VarChar, globalSubType || 'Other')
                    .input('period', sql.VarChar, period || p.period || '')
                    .input('amount', sql.Decimal(18, 2), parseFloat(p.amount) || 0)
                    .input('tax', sql.Decimal(18, 2), parseFloat(p.tax) || 0)
                    .input('voluntaryDeductions', sql.Decimal(18, 2), parseFloat(p.voluntaryDeductions) || 0)
                    .input('netAmountDue', sql.Decimal(18, 2), parseFloat(p.netAmountDue) || 0)
                    .input('description', sql.NVarChar, p.description || '')
                    .query(`INSERT INTO Payslips (IdNumber, batchId, payslipType, subType, period, amount, tax, voluntaryDeductions, netAmountDue, description, uploadDate, status) 
                            VALUES (@IdNumber, @batchId, @payslipType, @subType, @period, @amount, @tax, @voluntaryDeductions, @netAmountDue, @description, GETDATE(), 'active')`);
            }
            await transaction.commit();
            res.status(201).json({ message: 'Success' });
        } catch (err) {
            console.error('Bulk Error:', err.message);
            await transaction.rollback();
            throw err;
        }
    } catch (err) {
        res.status(500).json({ message: 'Error processing bulk upload' });
    }
});

router.delete('/:id', authenticateToken, authorizeRoles('admin'), async (req, res) => {
    try {
        const pool = getPool();
        await pool.request().input('id', sql.Int, req.params.id).query('DELETE FROM Payslips WHERE id = @id');
        res.json({ message: 'Deleted' });
    } catch (err) { res.status(500).json({ message: 'Error' }); }
});

router.delete('/batch/:id', authenticateToken, authorizeRoles('admin', 'uploader'), async (req, res) => {
    try {
        const pool = getPool();
        const transaction = new sql.Transaction(pool);
        await transaction.begin();
        try {
            await transaction.request().input('batchId', sql.Int, req.params.id).query('DELETE FROM Payslips WHERE batchId = @batchId');
            await transaction.request().input('id', sql.Int, req.params.id).query('DELETE FROM PayrollBatches WHERE id = @id');
            await transaction.commit();
            res.json({ message: 'Deleted' });
        } catch (err) {
            console.error('Delete Batch Transaction Error:', err.message);
            await transaction.rollback();
            throw err;
        }
    } catch (err) { 
        console.error('Delete Batch Server Error:', err.message);
        res.status(500).json({ message: 'Error deleting batch' }); 
    }
});

// UPDATE INDIVIDUAL RECORD
router.put('/:id', authenticateToken, authorizeRoles('admin', 'uploader'), async (req, res) => {
    try {
        const { amount, tax, voluntaryDeductions, netAmountDue, description } = req.body;
        const pool = getPool();
        const transaction = new sql.Transaction(pool);
        await transaction.begin();
        try {
            // Update the record
            const result = await transaction.request()
                .input('id', sql.Int, req.params.id)
                .input('amount', sql.Decimal(18, 2), amount)
                .input('tax', sql.Decimal(18, 2), tax)
                .input('ded', sql.Decimal(18, 2), voluntaryDeductions)
                .input('net', sql.Decimal(18, 2), netAmountDue)
                .input('desc', sql.NVarChar, description)
                .query(`
                    UPDATE Payslips 
                    SET amount = @amount, tax = @tax, voluntaryDeductions = @ded, netAmountDue = @net, description = @desc 
                    OUTPUT inserted.batchId
                    WHERE id = @id
                `);
            
            const batchId = result.recordset[0]?.batchId;

            if (batchId) {
                // Recalculate batch total
                await transaction.request()
                    .input('batchId', sql.Int, batchId)
                    .query(`
                        UPDATE PayrollBatches 
                        SET totalAmount = (SELECT SUM(netAmountDue) FROM Payslips WHERE batchId = @batchId)
                        WHERE id = @batchId
                    `);
            }

            await transaction.commit();
            res.json({ message: 'Updated' });
        } catch (err) {
            await transaction.rollback();
            throw err;
        }
    } catch (err) {
        res.status(500).json({ message: 'Error updating' });
    }
});

// MASTER WIPE (Admin Only - Clears everything for fresh start)
router.post('/wipe-all', authenticateToken, authorizeRoles('admin'), async (req, res) => {
    try {
        const pool = getPool();
        await pool.request().query('DELETE FROM Payslips; DELETE FROM PayrollBatches;');
        res.json({ message: 'All payroll data has been wiped.' });
    } catch (err) {
        res.status(500).json({ message: 'Error wiping data' });
    }
});

export default router;
