import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Tag, Plus, Trash2, CheckCircle, XCircle, AlertTriangle, ShieldAlert } from 'lucide-react';
import { motion } from 'framer-motion';

const BatchLabelSettings = () => {
  const { user } = useAuth();
  const [labels, setLabels] = useState([]);
  const [newLabel, setNewLabel] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => { fetchLabels(); }, []);

  const fetchLabels = async () => {
    try {
      const res = await axios.get('/api/batch-labels');
      setLabels(res.data);
    } catch (err) { console.error(err); }
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!newLabel) return;
    setLoading(true);
    try {
      await axios.post('/api/batch-labels', { label: newLabel });
      setNewLabel('');
      fetchLabels();
    } catch (err) { alert('Error adding label'); }
    finally { setLoading(false); }
  };

  const toggleStatus = async (id, currentStatus) => {
    const newStatus = currentStatus === 'active' ? 'disabled' : 'active';
    try {
      await axios.patch(`/api/batch-labels/${id}`, { status: newStatus });
      fetchLabels();
    } catch (err) { alert('Error updating status'); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Remove this category?')) return;
    try {
      await axios.delete(`/api/batch-labels/${id}`);
      fetchLabels();
    } catch (err) { alert('Error deleting'); }
  };

  const handleMasterWipe = async () => {
    if (window.confirm('CRITICAL ACTION: This will delete ALL payroll batches and ALL employee records from the database. This cannot be undone. Proceed?')) {
        const password = window.prompt('Type "DELETE" to confirm:');
        if (password === 'DELETE') {
            try {
                await axios.post('/api/payslips/wipe-all');
                alert('Database cleared successfully.');
            } catch (err) { alert('Wipe failed.'); }
        }
    }
  };

  return (
    <div className="max-w-4xl space-y-8">
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Payroll Settings</h1>
        <p className="text-slate-500 font-medium">Manage categories and global data</p>
      </div>

      <div className="bg-white rounded-[32px] border border-slate-200 shadow-sm p-8 space-y-6">
        <h2 className="text-sm font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
          <Tag className="w-4 h-4" /> Other Receivable Categories
        </h2>
        <form onSubmit={handleAdd} className="flex gap-4">
          <input 
            className="flex-1 input-field" 
            placeholder="e.g. PhilHealth Sharing, Honoraria, Bonus..." 
            value={newLabel}
            onChange={(e) => setNewLabel(e.target.value)}
          />
          <button disabled={loading} className="px-8 py-3 bg-primary-600 text-white rounded-2xl font-black text-sm flex items-center gap-2">
            <Plus className="w-5 h-5" /> Add Category
          </button>
        </form>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
          {labels.map((label) => (
            <div key={label.id} className="p-6 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between group">
              <div>
                <p className="font-bold text-slate-900">{label.label}</p>
                <span className={`text-[10px] font-black uppercase tracking-widest ${label.status === 'active' ? 'text-green-500' : 'text-slate-300'}`}>
                  {label.status}
                </span>
              </div>
              <div className="flex gap-2">
                <button onClick={() => toggleStatus(label.id, label.status)} className="p-2 text-slate-400 hover:text-primary-600 transition-colors">
                  {label.status === 'active' ? <CheckCircle className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
                </button>
                <button onClick={() => handleDelete(label.id)} className="p-2 text-slate-400 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100">
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {user?.role === 'admin' && (
        <div className="bg-red-50 rounded-[32px] border border-red-100 p-8 space-y-4">
          <div className="flex items-center gap-3 text-red-600">
            <ShieldAlert className="w-6 h-6" />
            <h2 className="text-lg font-black uppercase tracking-tighter">Danger Zone</h2>
          </div>
          <p className="text-red-800/60 text-sm font-medium">Use this to clear all payroll data if you need to start fresh or fix major data inconsistencies.</p>
          <button 
            onClick={handleMasterWipe}
            className="px-6 py-3 bg-red-600 text-white rounded-2xl font-black text-sm shadow-xl shadow-red-200 hover:bg-red-700 transition-all flex items-center gap-2"
          >
            <AlertTriangle className="w-5 h-5" /> Wipe All Payroll Data
          </button>
        </div>
      )}
    </div>
  );
};

export default BatchLabelSettings;
