import express from 'express';
import bcrypt from 'bcryptjs';
import { sql, getPool } from '../db.js';
import { authenticateToken, authorizeRoles } from '../middleware/auth.js';

const router = express.Router();

// Constant for the external database table
const EMP_TABLE = 'EmployeeManagement.dbo.Employees';

// GET all employees - with Pagination and Search
router.get('/', authenticateToken, authorizeRoles('admin', 'uploader'), async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || '';
    const offset = (page - 1) * limit;

    try {
        const pool = getPool();

        // Get total count for pagination
        const countResult = await pool.request()
            .input('search', sql.VarChar, `%${search}%`)
            .query(`SELECT COUNT(*) as total FROM ${EMP_TABLE} WHERE FullName LIKE @search OR IdNumber LIKE @search OR Department LIKE @search`);

        const total = countResult.recordset[0].total;

        // Get paginated data
        const result = await pool.request()
            .input('search', sql.VarChar, `%${search}%`)
            .input('offset', sql.Int, offset)
            .input('limit', sql.Int, limit)
            .query(`
                SELECT * FROM ${EMP_TABLE} 
                WHERE FullName LIKE @search OR IdNumber LIKE @search OR Department LIKE @search
                ORDER BY FullName ASC 
                OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY
            `);

        res.json({
            data: result.recordset,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            }
        });
    } catch (err) {
        console.error('Pagination Error:', err.message);
        res.status(500).json({ message: 'Error fetching paginated employees' });
    }
});

// CREATE employee - Admin and Uploader
router.post('/', authenticateToken, authorizeRoles('admin', 'uploader'), async (req, res) => {
    const {
        IdNumber, FullName, Position, Department, Unit, DateOfBirth,
        GsisBpNo, PagIbigMidNo, PhicNo, TinNo, BloodType, MedicalConditions,
        EmergencyContactPerson, EmergencyContactNumber, EmergencyContactAddress
    } = req.body;

    const cleanId = String(IdNumber || '').trim();

    try {
        const pool = getPool();

        // Check if ID already exists to provide a better error message
        const check = await pool.request()
            .input('IdNumber', sql.VarChar, cleanId)
            .query(`SELECT IdNumber FROM ${EMP_TABLE} WHERE LTRIM(RTRIM(IdNumber)) = @IdNumber`);
        
        if (check.recordset.length > 0) {
            return res.status(409).json({ message: `Employee ID "${cleanId}" already exists in the registry.` });
        }

        await pool.request()
            .input('IdNumber', sql.VarChar, cleanId)
            .input('FullName', sql.VarChar, FullName)
            .input('Position', sql.VarChar, Position)
            .input('Department', sql.VarChar, Department)
            .input('Unit', sql.VarChar, Unit)
            .input('DateOfBirth', sql.Date, DateOfBirth)
            .input('GsisBpNo', sql.VarChar, GsisBpNo)
            .input('PagIbigMidNo', sql.VarChar, PagIbigMidNo)
            .input('PhicNo', sql.VarChar, PhicNo)
            .input('TinNo', sql.VarChar, TinNo)
            .input('BloodType', sql.VarChar, BloodType)
            .input('MedicalConditions', sql.NVarChar, MedicalConditions)
            .input('EmergencyContactPerson', sql.VarChar, EmergencyContactPerson)
            .input('EmergencyContactNumber', sql.VarChar, EmergencyContactNumber)
            .input('EmergencyContactAddress', sql.NVarChar, EmergencyContactAddress)
            .query(`INSERT INTO ${EMP_TABLE} (
                IdNumber, FullName, Position, Department, Unit, DateOfBirth, 
                GsisBpNo, PagIbigMidNo, PhicNo, TinNo, BloodType, MedicalConditions,
                EmergencyContactPerson, EmergencyContactNumber, EmergencyContactAddress
            ) VALUES (
                @IdNumber, @FullName, @Position, @Department, @Unit, @DateOfBirth, 
                @GsisBpNo, @PagIbigMidNo, @PhicNo, @TinNo, @BloodType, @MedicalConditions,
                @EmergencyContactPerson, @EmergencyContactNumber, @EmergencyContactAddress
            )`);

        // AUTO-CREATE USER ACCOUNT
        try {
            const dob = new Date(DateOfBirth);
            const passwordRaw = dob.getFullYear().toString() + 
                               (dob.getMonth() + 1).toString().padStart(2, '0') + 
                               dob.getDate().toString().padStart(2, '0');
            const hashedPassword = await bcrypt.hash(passwordRaw, 10);

            await pool.request()
                .input('username', sql.NVarChar, cleanId)
                .input('password', sql.NVarChar, hashedPassword)
                .input('role', sql.NVarChar, 'viewer')
                .query(`INSERT INTO Users (username, password, role) VALUES (@username, @password, @role)`);
            
            console.log(`Auto-Account Created: ${cleanId} / ${passwordRaw}`);
        } catch (authErr) {
            console.error('Account Creation Warning:', authErr.message);
            // We don't fail the employee creation if user creation fails (e.g. user already exists)
        }

        res.status(201).json({ message: 'Employee created and account provisioned successfully' });
    } catch (err) {
        console.error('Create Error:', err.message);
        res.status(500).json({ message: err.message || 'Error creating employee' });
    }
});

// UPDATE employee - Admin and Uploader
router.put('/:id', authenticateToken, authorizeRoles('admin', 'uploader'), async (req, res) => {
    const { id } = req.params;
    const {
        FullName, Position, Department, Unit, DateOfBirth,
        GsisBpNo, PagIbigMidNo, PhicNo, TinNo, BloodType, MedicalConditions,
        EmergencyContactPerson, EmergencyContactNumber, EmergencyContactAddress
    } = req.body;

    try {
        const pool = getPool();
        await pool.request()
            .input('id', sql.VarChar, id)
            .input('FullName', sql.VarChar, FullName)
            .input('Position', sql.VarChar, Position)
            .input('Department', sql.VarChar, Department)
            .input('Unit', sql.VarChar, Unit)
            .input('DateOfBirth', sql.Date, DateOfBirth)
            .input('GsisBpNo', sql.VarChar, GsisBpNo)
            .input('PagIbigMidNo', sql.VarChar, PagIbigMidNo)
            .input('PhicNo', sql.VarChar, PhicNo)
            .input('TinNo', sql.VarChar, TinNo)
            .input('BloodType', sql.VarChar, BloodType)
            .input('MedicalConditions', sql.NVarChar, MedicalConditions)
            .input('EmergencyContactPerson', sql.VarChar, EmergencyContactPerson)
            .input('EmergencyContactNumber', sql.VarChar, EmergencyContactNumber)
            .input('EmergencyContactAddress', sql.NVarChar, EmergencyContactAddress)
            .query(`UPDATE ${EMP_TABLE} SET 
                FullName = @FullName, 
                Position = @Position, 
                Department = @Department, 
                Unit = @Unit, 
                DateOfBirth = @DateOfBirth, 
                GsisBpNo = @GsisBpNo, 
                PagIbigMidNo = @PagIbigMidNo, 
                PhicNo = @PhicNo, 
                TinNo = @TinNo, 
                BloodType = @BloodType, 
                MedicalConditions = @MedicalConditions,
                EmergencyContactPerson = @EmergencyContactPerson, 
                EmergencyContactNumber = @EmergencyContactNumber, 
                EmergencyContactAddress = @EmergencyContactAddress 
            WHERE IdNumber = @id`);

        res.json({ message: 'Employee updated successfully' });
    } catch (err) {
        console.error('Update Error:', err.message);
        res.status(500).json({ message: 'Error updating employee' });
    }
});

// DELETE employee - ADMIN ONLY
router.delete('/:id', authenticateToken, authorizeRoles('admin'), async (req, res) => {
    const { id } = req.params;
    try {
        const pool = getPool();
        await pool.request()
            .input('id', sql.VarChar, id)
            .query(`DELETE FROM ${EMP_TABLE} WHERE IdNumber = @id`);

        res.json({ message: 'Employee deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Error deleting employee' });
    }
});

export default router;