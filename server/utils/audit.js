import { sql, getPool } from '../db.js';

/**
 * Log an administrative action to the AuditLogs table
 * @param {number} userId - The ID of the user performing the action
 * @param {string} username - The username of the user
 * @param {string} action - The action type (e.g., 'DELETE_BATCH')
 * @param {string} details - Detailed description or JSON string of affected data
 * @param {string} ip - IP address of the user (optional)
 */
export const logAudit = async (userId, username, action, details, ip = 'N/A') => {
    try {
        const pool = getPool();
        await pool.request()
            .input('userId', sql.Int, userId || 0)
            .input('username', sql.NVarChar, username || 'SYSTEM')
            .input('action', sql.NVarChar, action)
            .input('details', sql.NVarChar, details)
            .input('ip', sql.NVarChar, ip)
            .query(`
                INSERT INTO AuditLogs (userId, username, action, details, ipAddress)
                VALUES (@userId, @username, @action, @details, @ip)
            `);
    } catch (err) {
        console.error('Audit Log Error:', err.message);
    }
};
