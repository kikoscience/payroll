import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, Clock, User, Activity, AlertTriangle, Search, Filter } from 'lucide-react';
import { motion } from 'framer-motion';

const AuditLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      // Need to create this API endpoint
      const res = await axios.get('/api/audit');
      setLogs(res.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const filteredLogs = logs.filter(l => 
    l.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    l.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
    l.details.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Security Audit Logs</h1>
        <p className="text-slate-500 font-medium text-sm">Monitor all administrative actions and system changes</p>
      </div>

      <div className="relative group">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
        <input 
          type="text" 
          placeholder="Search by admin, action, or details..." 
          className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-[24px] font-bold focus:outline-none focus:ring-4 focus:ring-primary-500/10 shadow-sm"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 text-slate-400 text-[10px] font-black uppercase tracking-widest border-b border-slate-100">
                <th className="px-8 py-6">Timestamp</th>
                <th className="px-8 py-6">Administrator</th>
                <th className="px-8 py-6">Action</th>
                <th className="px-8 py-6">Details</th>
                <th className="px-8 py-6">IP Address</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr><td colSpan="5" className="px-8 py-12 text-center text-slate-400 font-bold">Loading audit logs...</td></tr>
              ) : filteredLogs.length === 0 ? (
                <tr><td colSpan="5" className="px-8 py-20 text-center"><p className="text-slate-400 italic">No activity recorded yet.</p></td></tr>
              ) : (
                filteredLogs.map((log, i) => (
                  <tr key={log.id} className="hover:bg-slate-50/50 transition-all text-sm">
                    <td className="px-8 py-5 text-slate-400 font-medium">
                       {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td className="px-8 py-5">
                       <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-600 text-xs uppercase">
                             {log.username.charAt(0)}
                          </div>
                          <span className="font-bold text-slate-900">{log.username}</span>
                       </div>
                    </td>
                    <td className="px-8 py-5">
                       <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                          log.action.includes('DELETE') || log.action.includes('WIPE') 
                          ? 'bg-red-50 text-red-600' 
                          : 'bg-indigo-50 text-indigo-600'
                       }`}>
                          {log.action}
                       </span>
                    </td>
                    <td className="px-8 py-5 text-slate-600 font-medium max-w-xs truncate">
                       {log.details}
                    </td>
                    <td className="px-8 py-5 font-mono text-[10px] text-slate-400">
                       {log.ipAddress}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AuditLogs;
