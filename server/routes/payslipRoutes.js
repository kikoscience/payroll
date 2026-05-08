import express from 'express';
import { sql, getPool } from '../db.js';
import { authenticateToken, authorizeRoles } from '../middleware/auth.js';

const router = express.Router();
const EMP_TABLE = 'EmployeeManagement.dbo.Employees';

// RE-ENGINEERED ROBUST MIGRATION
const ensureColumns = async () => {
    console.log('🔄 Starting Database Sync...');
    let pool;
    try {
        pool = getPool();
        const columns = [
            { name: 'salaries_si', type: 'DECIMAL(18,2) DEFAULT 0' },
            { name: 'due_to_others_earnings', type: 'DECIMAL(18,2) DEFAULT 0' },
            { name: 'absences', type: 'DECIMAL(18,2) DEFAULT 0' },
            { name: 'pera', type: 'DECIMAL(18,2) DEFAULT 0' },
            { name: 'sa', type: 'DECIMAL(18,2) DEFAULT 0' },
            { name: 'la', type: 'DECIMAL(18,2) DEFAULT 0' },
            { name: 'hazard_pay', type: 'DECIMAL(18,2) DEFAULT 0' },
            { name: 'night_shift_differential', type: 'DECIMAL(18,2) DEFAULT 0' },
            { name: 'gsis_ps', type: 'DECIMAL(18,2) DEFAULT 0' },
            { name: 'gsis_conso_loan', type: 'DECIMAL(18,2) DEFAULT 0' },
            { name: 'gsis_eml', type: 'DECIMAL(18,2) DEFAULT 0' },
            { name: 'gsis_policy_loan', type: 'DECIMAL(18,2) DEFAULT 0' },
            { name: 'gfal', type: 'DECIMAL(18,2) DEFAULT 0' },
            { name: 'gsis_mpl', type: 'DECIMAL(18,2) DEFAULT 0' },
            { name: 'gsis_mpl_lite', type: 'DECIMAL(18,2) DEFAULT 0' },
            { name: 'gsis_cpl', type: 'DECIMAL(18,2) DEFAULT 0' },
            { name: 'pagibig_ps', type: 'DECIMAL(18,2) DEFAULT 0' },
            { name: 'pagibig_mp2', type: 'DECIMAL(18,2) DEFAULT 0' },
            { name: 'pagibig_mpl', type: 'DECIMAL(18,2) DEFAULT 0' },
            { name: 'pagibig_cal', type: 'DECIMAL(18,2) DEFAULT 0' },
            { name: 'phic_ps', type: 'DECIMAL(18,2) DEFAULT 0' },
            { name: 'lbp', type: 'DECIMAL(18,2) DEFAULT 0' },
            { name: 'due_from_others', type: 'DECIMAL(18,2) DEFAULT 0' },
            { name: 'payslipType', type: 'NVARCHAR(50)' },
            { name: 'subType', type: 'NVARCHAR(100)' },
            { name: 'FullName', type: 'NVARCHAR(255)' },
            { name: 'status', type: 'NVARCHAR(20) DEFAULT \'active\'' }
        ];
        
        for (const col of columns) {
            // Using a more direct sys.columns check with explicit dbo schema
            await pool.request().query(`
                IF NOT EXISTS (
                    SELECT 1 FROM sys.columns 
                    WHERE object_id = OBJECT_ID('dbo.Payslips') 
                    AND name = '${col.name}'
                )
                BEGIN
                    PRINT 'Adding column ${col.name}...'
                    ALTER TABLE dbo.Payslips ADD ${col.name} ${col.type};
                END
            `);
        }
        console.log('✅ Database Sync Complete: Payslips table is up to date.');
    } catch (err) {
        console.error('❌ Sync Failed:', err.message);
        // Try again in 5 seconds if it failed (likely DB connection not ready)
        setTimeout(ensureColumns, 5000);
    }
};

// Start the sync process
setTimeout(ensureColumns, 2000); 

// GET all Batches
router.get('/batches', authenticateToken, async (req, res) => {
    const { type } = req.query;
    try {
        const pool = getPool();
        const result = await pool.request()
            .input('type', sql.VarChar, type)
            .query(`SELECT * FROM PayrollBatches ${type ? 'WHERE batchType = @type' : ''} ORDER BY uploadDate DESC`);
        res.json(result.recordset);
    } catch (err) { res.status(500).json({ message: err.message }); }
});

// GET all payslips
router.get('/', authenticateToken, async (req, res) => {
    const { search, batchId } = req.query;
    try {
        const pool = getPool();
        let query = `
            SELECT p.*, e.FullName 
            FROM Payslips p
            LEFT JOIN ${EMP_TABLE} e ON p.IdNumber = e.IdNumber
            WHERE (e.FullName LIKE @search OR p.IdNumber LIKE @search)
        `;
        if (batchId) query += ` AND p.batchId = @batchId`;
        query += ` ORDER BY p.uploadDate DESC`;

        const result = await pool.request()
            .input('search', sql.VarChar, `%${search || ''}%`)
            .input('batchId', sql.Int, batchId)
            .query(query);
        res.json(result.recordset);
    } catch (err) { res.status(500).json({ message: err.message }); }
});

// BULK UPLOAD
router.post('/bulk', authenticateToken, authorizeRoles('admin', 'uploader'), async (req, res) => {
    const { payslips, batchName, period, globalType, globalSubType } = req.body;
    try {
        const pool = getPool();
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
                await transaction.request()
                    .input('IdNumber', sql.VarChar, p.IdNumber)
                    .input('batchId', sql.Int, batchId)
                    .input('payslipType', sql.VarChar, globalType)
                    .input('subType', sql.VarChar, globalSubType)
                    .input('period', sql.VarChar, period)
                    .input('salaries_si', sql.Decimal(18, 2), parseFloat(p.salaries_si) || 0)
                    .input('due_to_others_earnings', sql.Decimal(18, 2), parseFloat(p.due_to_others) || 0)
                    .input('absences', sql.Decimal(18, 2), parseFloat(p.absences) || 0)
                    .input('pera', sql.Decimal(18, 2), parseFloat(p.pera) || 0)
                    .input('sa', sql.Decimal(18, 2), parseFloat(p.sa) || 0)
                    .input('la', sql.Decimal(18, 2), parseFloat(p.la) || 0)
                    .input('hazard_pay', sql.Decimal(18, 2), parseFloat(p.hazard_pay) || 0)
                    .input('night_shift_differential', sql.Decimal(18, 2), parseFloat(p.night_shift_differential) || 0)
                    .input('amount', sql.Decimal(18, 2), parseFloat(p.amount) || 0)
                    .input('tax', sql.Decimal(18, 2), parseFloat(p.tax) || 0)
                    .input('gsis_ps', sql.Decimal(18, 2), parseFloat(p.gsis_ps) || 0)
                    .input('gsis_conso_loan', sql.Decimal(18, 2), parseFloat(p.gsis_conso_loan) || 0)
                    .input('gsis_eml', sql.Decimal(18, 2), parseFloat(p.gsis_eml) || 0)
                    .input('gsis_policy_loan', sql.Decimal(18, 2), parseFloat(p.gsis_policy_loan) || 0)
                    .input('gfal', sql.Decimal(18, 2), parseFloat(p.gfal) || 0)
                    .input('gsis_mpl', sql.Decimal(18, 2), parseFloat(p.gsis_mpl) || 0)
                    .input('gsis_mpl_lite', sql.Decimal(18, 2), parseFloat(p.gsis_mpl_lite) || 0)
                    .input('gsis_cpl', sql.Decimal(18, 2), parseFloat(p.gsis_cpl) || 0)
                    .input('pagibig_ps', sql.Decimal(18, 2), parseFloat(p.pagibig_ps) || 0)
                    .input('pagibig_mp2', sql.Decimal(18, 2), parseFloat(p.pagibig_mp2) || 0)
                    .input('pagibig_mpl', sql.Decimal(18, 2), parseFloat(p.pagibig_mpl) || 0)
                    .input('pagibig_cal', sql.Decimal(18, 2), parseFloat(p.pagibig_cal) || 0)
                    .input('phic_ps', sql.Decimal(18, 2), parseFloat(p.phic_ps) || 0)
                    .input('lbp', sql.Decimal(18, 2), parseFloat(p.lbp) || 0)
                    .input('due_from_others', sql.Decimal(18, 2), parseFloat(p.due_from_others) || 0)
                    .input('voluntaryDeductions', sql.Decimal(18, 2), parseFloat(p.voluntaryDeductions) || 0)
                    .input('netAmountDue', sql.Decimal(18, 2), parseFloat(p.netAmountDue) || 0)
                    .input('description', sql.NVarChar, p.description || '')
                    .query(`INSERT INTO Payslips (
                                IdNumber, batchId, payslipType, subType, period, amount, tax, voluntaryDeductions, netAmountDue, description, uploadDate, status,
                                salaries_si, due_to_others_earnings, absences, pera, sa, la, hazard_pay, night_shift_differential,
                                gsis_ps, gsis_conso_loan, gsis_eml, gsis_policy_loan, gfal, gsis_mpl, gsis_mpl_lite, gsis_cpl,
                                pagibig_ps, pagibig_mp2, pagibig_mpl, pagibig_cal, phic_ps, lbp, due_from_others
                            ) VALUES (
                                @IdNumber, @batchId, @payslipType, @subType, @period, @amount, @tax, @voluntaryDeductions, @netAmountDue, @description, GETDATE(), 'active',
                                @salaries_si, @due_to_others_earnings, @absences, @pera, @sa, @la, @hazard_pay, @night_shift_differential,
                                @gsis_ps, @gsis_conso_loan, @gsis_eml, @gsis_policy_loan, @gfal, @gsis_mpl, @gsis_mpl_lite, @gsis_cpl,
                                @pagibig_ps, @pagibig_mp2, @pagibig_mpl, @pagibig_cal, @phic_ps, @lbp, @due_from_others
                            )`);
            }
            await transaction.commit();
            res.status(201).json({ message: 'Success' });
        } catch (err) { 
            console.error('Bulk Insert Error:', err.message);
            await transaction.rollback(); 
            res.status(500).json({ message: 'DB Error: ' + err.message });
        }
    } catch (err) { res.status(500).json({ message: 'Server Error: ' + err.message }); }
});

router.put('/:id', authenticateToken, authorizeRoles('admin', 'uploader'), async (req, res) => {
    try {
        const p = req.body;
        const pool = getPool();
        const transaction = new sql.Transaction(pool);
        await transaction.begin();
        try {
            const result = await transaction.request()
                .input('id', sql.Int, req.params.id)
                .input('salaries_si', sql.Decimal(18, 2), p.salaries_si || 0)
                .input('due_to_others_earnings', sql.Decimal(18, 2), p.due_to_others || 0)
                .input('absences', sql.Decimal(18, 2), p.absences || 0)
                .input('pera', sql.Decimal(18, 2), p.pera || 0)
                .input('sa', sql.Decimal(18, 2), p.sa || 0)
                .input('la', sql.Decimal(18, 2), p.la || 0)
                .input('hazard_pay', sql.Decimal(18, 2), p.hazard_pay || 0)
                .input('night_shift_differential', sql.Decimal(18, 2), p.night_shift_differential || 0)
                .input('amount', sql.Decimal(18, 2), p.amount || 0)
                .input('tax', sql.Decimal(18, 2), p.tax || 0)
                .input('gsis_ps', sql.Decimal(18, 2), p.gsis_ps || 0)
                .input('gsis_conso_loan', sql.Decimal(18, 2), p.gsis_conso_loan || 0)
                .input('gsis_eml', sql.Decimal(18, 2), p.gsis_eml || 0)
                .input('gsis_policy_loan', sql.Decimal(18, 2), p.gsis_policy_loan || 0)
                .input('gfal', sql.Decimal(18, 2), p.gfal || 0)
                .input('gsis_mpl', sql.Decimal(18, 2), p.gsis_mpl || 0)
                .input('gsis_mpl_lite', sql.Decimal(18, 2), p.gsis_mpl_lite || 0)
                .input('gsis_cpl', sql.Decimal(18, 2), p.gsis_cpl || 0)
                .input('pagibig_ps', sql.Decimal(18, 2), p.pagibig_ps || 0)
                .input('pagibig_mp2', sql.Decimal(18, 2), p.pagibig_mp2 || 0)
                .input('pagibig_mpl', sql.Decimal(18, 2), p.pagibig_mpl || 0)
                .input('pagibig_cal', sql.Decimal(18, 2), p.pagibig_cal || 0)
                .input('phic_ps', sql.Decimal(18, 2), p.phic_ps || 0)
                .input('lbp', sql.Decimal(18, 2), p.lbp || 0)
                .input('due_from_others', sql.Decimal(18, 2), p.due_from_others || 0)
                .input('voluntaryDeductions', sql.Decimal(18, 2), p.voluntaryDeductions || 0)
                .input('netAmountDue', sql.Decimal(18, 2), p.netAmountDue || 0)
                .input('desc', sql.NVarChar, p.description || '')
                .query(`
                    UPDATE Payslips 
                    SET 
                        salaries_si = @salaries_si, due_to_others_earnings = @due_to_others_earnings, absences = @absences, pera = @pera, sa = @sa, la = @la, hazard_pay = @hazard_pay, night_shift_differential = @night_shift_differential,
                        amount = @amount, tax = @tax, gsis_ps = @gsis_ps, gsis_conso_loan = @gsis_conso_loan, gsis_eml = @gsis_eml, gsis_policy_loan = @gsis_policy_loan, gfal = @gfal, gsis_mpl = @gsis_mpl, gsis_mpl_lite = @gsis_mpl_lite, gsis_cpl = @gsis_cpl,
                        pagibig_ps = @pagibig_ps, pagibig_mp2 = @pagibig_mp2, pagibig_mpl = @pagibig_mpl, pagibig_cal = @pagibig_cal, phic_ps = @phic_ps, lbp = @lbp, due_from_others = @due_from_others,
                        voluntaryDeductions = @voluntaryDeductions, netAmountDue = @netAmountDue, description = @desc 
                    OUTPUT inserted.batchId
                    WHERE id = @id
                `);
            const batchId = result.recordset[0]?.batchId;
            if (batchId) {
                await transaction.request().input('batchId', sql.Int, batchId).query(`UPDATE PayrollBatches SET totalAmount = (SELECT SUM(netAmountDue) FROM Payslips WHERE batchId = @batchId) WHERE id = @batchId`);
            }
            await transaction.commit();
            res.json({ message: 'Updated' });
        } catch (err) { await transaction.rollback(); res.status(500).json({ message: 'Update Error: ' + err.message }); }
    } catch (err) { res.status(500).json({ message: 'Server Error: ' + err.message }); }
});

router.delete('/:id', authenticateToken, authorizeRoles('admin'), async (req, res) => {
    try {
        const pool = getPool();
        await pool.request().input('id', sql.Int, req.params.id).query('DELETE FROM Payslips WHERE id = @id');
        res.json({ message: 'Deleted' });
    } catch (err) { res.status(500).json({ message: err.message }); }
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
        } catch (err) { await transaction.rollback(); res.status(500).json({ message: err.message }); }
    } catch (err) { res.status(500).json({ message: err.message }); }
});

router.post('/wipe-all', authenticateToken, authorizeRoles('admin'), async (req, res) => {
    try {
        const pool = getPool();
        await pool.request().query('DELETE FROM Payslips; DELETE FROM PayrollBatches;');
        res.json({ message: 'Wiped' });
    } catch (err) { res.status(500).json({ message: err.message }); }
});

export default router;
