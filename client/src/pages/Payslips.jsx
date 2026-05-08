import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { FileText, Plus, Search, Calendar, DollarSign, Trash2, Tag, User, Upload, Check, ChevronRight, Layers, FileSpreadsheet, Download, Settings, Eye, EyeOff } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Payslips = () => {
  const { user } = useAuth();
  const [viewMode, setViewMode] = useState('batches'); 
  const [batches, setBatches] = useState([]);
  const [individualPayslips, setIndividualPayslips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isBulkOpen, setIsBulkOpen] = useState(false);
  const [isLabelManagerOpen, setIsLabelManagerOpen] = useState(false);

  useEffect(() => {
    if (viewMode === 'batches') fetchBatches();
    else fetchIndividual();
  }, [viewMode]);

  const fetchBatches = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/payslips/batches');
      setBatches(res.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const fetchIndividual = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/payslips?type=Other Receivables');
      setIndividualPayslips(res.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const downloadTemplate = () => {
    const headers = "employeeID,Amount,Tax,Voluntary_Deductions,NetAmountDue,Period,Remarks\n";
    const sample = "CDH-2023-278,9892.08,601.29,0,9290.79,2026-05,Full payment";
    const blob = new Blob([headers + sample], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'payroll_template.csv';
    a.click();
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Payslip Management</h1>
          <p className="text-slate-500">Processing Batch Payroll and Ad-hoc Receivables</p>
        </div>
        <div className="flex gap-3">
          {(user?.role === 'admin' || user?.role === 'uploader') && (
            <button onClick={() => setIsLabelManagerOpen(true)} className="p-2.5 bg-white border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 transition-all shadow-sm">
              <Settings className="w-5 h-5" />
            </button>
          )}
          <button onClick={downloadTemplate} className="px-4 py-2 bg-slate-100 border border-slate-200 rounded-xl text-slate-600 font-bold flex items-center gap-2 hover:bg-slate-200 transition-all">
            <Download className="w-5 h-5" /> Template
          </button>
          {(user?.role === 'admin' || user?.role === 'uploader') && (
            <button onClick={() => setIsBulkOpen(true)} className="btn-primary flex items-center gap-2 shadow-lg shadow-primary-200">
              <Upload className="w-5 h-5" /> Upload File
            </button>
          )}
        </div>
      </div>

      <div className="flex bg-slate-100 p-1.5 rounded-2xl w-fit">
        <button onClick={() => setViewMode('batches')} className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${viewMode === 'batches' ? 'bg-white text-primary-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
          <Layers className="w-4 h-4" /> Monthly Batches
        </button>
        <button onClick={() => setViewMode('individual')} className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${viewMode === 'individual' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
          <User className="w-4 h-4" /> Other Receivables
        </button>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        {viewMode === 'batches' ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50/50 text-slate-400 text-[10px] font-black uppercase tracking-widest">
                  <th className="px-8 py-5">Batch Description</th>
                  <th className="px-8 py-5 text-right">Employees</th>
                  <th className="px-8 py-5 text-right">Total Net</th>
                  <th className="px-8 py-5">Date</th>
                  <th className="px-8 py-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (<tr><td colSpan="5" className="px-8 py-10 text-center text-slate-400">Loading...</td></tr>) : batches.map((b) => (
                  <tr key={b.id} className="hover:bg-slate-50/50 transition-all">
                    <td className="px-8 py-5">
                      <p className="font-bold text-slate-900">{b.batchName}</p>
                      <p className="text-xs text-slate-400 font-black tracking-tighter uppercase">{b.period}</p>
                    </td>
                    <td className="px-8 py-5 text-right font-bold text-slate-600">{b.recordCount}</td>
                    <td className="px-8 py-5 text-right font-black text-primary-600">₱{b.totalAmount?.toLocaleString()}</td>
                    <td className="px-8 py-5 text-xs text-slate-400">{new Date(b.uploadDate).toLocaleDateString()}</td>
                    <td className="px-8 py-5 text-right">
                      <button className="p-2 text-primary-600 hover:bg-primary-50 rounded-lg transition-all"><ChevronRight className="w-5 h-5" /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50/50 text-slate-400 text-[10px] font-black uppercase tracking-widest">
                  <th className="px-8 py-5">Employee</th>
                  <th className="px-8 py-5">Type</th>
                  <th className="px-8 py-5">Remarks</th>
                  <th className="px-8 py-5 text-right">Net Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (<tr><td colSpan="4" className="px-8 py-10 text-center text-slate-400">Loading...</td></tr>) : individualPayslips.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/50 transition-all">
                    <td className="px-8 py-5">
                      <p className="font-bold text-slate-900">{p.FullName}</p>
                      <p className="text-xs text-slate-400 font-mono">{p.IdNumber}</p>
                    </td>
                    <td className="px-8 py-5">
                      <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 text-[10px] font-black rounded uppercase">{p.subType || 'Other'}</span>
                      <p className="text-[10px] text-slate-400 mt-0.5">{p.period}</p>
                    </td>
                    <td className="px-8 py-5 text-xs text-slate-500 italic max-w-xs truncate">{p.description || '-'}</td>
                    <td className="px-8 py-5 text-right font-black text-indigo-600">₱{p.netAmountDue?.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <BulkUploadModal isOpen={isBulkOpen} onClose={() => setIsBulkOpen(false)} onSuccess={() => { fetchBatches(); fetchIndividual(); }} />
      <LabelManagerModal isOpen={isLabelManagerOpen} onClose={() => setIsLabelManagerOpen(false)} />
    </div>
  );
};

// --- LABEL MANAGER MODAL ---
const LabelManagerModal = ({ isOpen, onClose }) => {
  const [labels, setLabels] = useState([]);
  const [newLabel, setNewLabel] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => { if (isOpen) fetchLabels(); }, [isOpen]);

  const fetchLabels = async () => {
    const res = await axios.get('/api/batch-labels');
    setLabels(res.data);
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!newLabel) return;
    await axios.post('/api/batch-labels', { label: newLabel });
    setNewLabel('');
    fetchLabels();
  };

  const handleToggle = async (id, currentStatus) => {
    const newStatus = currentStatus === 'active' ? 'disabled' : 'active';
    await axios.patch(`/api/batch-labels/${id}/status`, { status: newStatus });
    fetchLabels();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <h2 className="text-xl font-bold text-slate-900">Manage Batch Labels</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">&times;</button>
        </div>
        <div className="p-6 space-y-6">
           <form onSubmit={handleAdd} className="flex gap-2">
             <input className="input-field" placeholder="New Label (e.g. Regular Payroll)" value={newLabel} onChange={(e) => setNewLabel(e.target.value)} />
             <button type="submit" className="px-4 py-2 bg-primary-600 text-white rounded-xl font-bold text-sm">Add</button>
           </form>
           <div className="max-h-60 overflow-y-auto space-y-2">
             {labels.map(l => (
               <div key={l.id} className={`flex items-center justify-between p-3 rounded-xl border ${l.status === 'disabled' ? 'bg-slate-50 opacity-60' : 'bg-white border-slate-100 shadow-sm'}`}>
                 <span className="font-bold text-slate-700">{l.label}</span>
                 <button onClick={() => handleToggle(l.id, l.status)} className={`p-2 rounded-lg transition-all ${l.status === 'active' ? 'text-slate-400 hover:text-red-500 hover:bg-red-50' : 'text-primary-600 hover:bg-primary-50'}`}>
                   {l.status === 'active' ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                 </button>
               </div>
             ))}
           </div>
        </div>
      </motion.div>
    </div>
  );
};

// --- BULK UPLOAD MODAL ---
const BulkUploadModal = ({ isOpen, onClose, onSuccess }) => {
  const [csvData, setCsvData] = useState([]);
  const [labels, setLabels] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploadType, setUploadType] = useState('Payroll');
  const [batchInfo, setBatchInfo] = useState({ label: '', period: '' });
  const fileInputRef = useRef(null);

  useEffect(() => {
    const fetchLabels = async () => {
      const res = await axios.get('/api/batch-labels');
      const active = res.data.filter(l => l.status === 'active');
      setLabels(active);
      if (active.length > 0) setBatchInfo(prev => ({ ...prev, label: active[0].label }));
    };
    if (isOpen) fetchLabels();
  }, [isOpen]);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const rows = event.target.result.split('\n').filter(r => r.trim() !== '');
      const parsed = rows.slice(1).map(row => {
        const col = row.split(',').map(c => c.trim());
        return {
          IdNumber: col[0] || '',
          amount: parseFloat(col[1]) || 0,
          tax: parseFloat(col[2]) || 0,
          voluntaryDeductions: parseFloat(col[3]) || 0,
          netAmountDue: parseFloat(col[4]) || 0,
          period: col[5] || '',
          description: col[6] || ''
        };
      });
      setCsvData(parsed);
      if (parsed.length > 0 && !batchInfo.period) {
        // Handle YYYY-MM conversion for preview if needed, or keep as string
        setBatchInfo(prev => ({ ...prev, period: parsed[0].period }));
      }
    };
    reader.readAsText(file);
  };

  const handleBulkSubmit = async () => {
    setLoading(true);
    try {
      await axios.post('/api/payslips/bulk', { 
        payslips: csvData, 
        batchName: uploadType === 'Payroll' ? batchInfo.label : null, 
        period: batchInfo.period,
        globalType: uploadType === 'Payroll' ? 'Payroll' : 'Other Receivables',
        globalSubType: uploadType === 'Payroll' ? 'Monthly' : batchInfo.label
      });
      onSuccess();
      onClose();
    } catch (err) { alert('Failed'); }
    finally { setLoading(false); }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-[40px] w-full max-w-5xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="p-8 border-b border-slate-100 bg-slate-50/50">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-black text-slate-900">Upload Financial Records</h2>
            <button onClick={onClose} className="p-2 hover:bg-white rounded-full text-slate-400">&times;</button>
          </div>
          <div className="flex gap-4 p-1.5 bg-slate-200/50 rounded-2xl w-fit">
            <button onClick={() => setUploadType('Payroll')} className={`px-6 py-2 rounded-xl text-xs font-black transition-all ${uploadType === 'Payroll' ? 'bg-primary-600 text-white shadow-lg' : 'text-slate-500'}`}>MONTHLY PAYROLL</button>
            <button onClick={() => setUploadType('Other')} className={`px-6 py-2 rounded-xl text-xs font-black transition-all ${uploadType === 'Other' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500'}`}>OTHER RECEIVABLES</button>
          </div>
        </div>

        <div className="p-8 flex-1 overflow-y-auto space-y-6">
          <div className="grid grid-cols-2 gap-6">
             <div>
               <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Batch Label / Specific Type</label>
               <select className="input-field" value={batchInfo.label} onChange={(e) => setBatchInfo({...batchInfo, label: e.target.value})}>
                 {labels.map(l => <option key={l.id} value={l.label}>{l.label}</option>)}
               </select>
             </div>
             <div>
               <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Payroll Period (Month/Year)</label>
               <input type="month" className="input-field" value={batchInfo.period} onChange={(e) => setBatchInfo({...batchInfo, period: e.target.value})} />
             </div>
          </div>

          {csvData.length === 0 ? (
            <div onClick={() => fileInputRef.current.click()} className="border-4 border-dashed border-slate-100 rounded-[32px] p-20 text-center hover:border-primary-200 hover:bg-primary-50/30 transition-all cursor-pointer">
              <Upload className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <p className="text-lg font-bold text-slate-600">Select File to Preview</p>
              <input type="file" accept=".csv" className="hidden" ref={fileInputRef} onChange={handleFileUpload} />
            </div>
          ) : (
            <div className="space-y-4">
               <div className="flex items-center justify-between bg-slate-900 p-5 rounded-3xl text-white shadow-lg">
                  <div className="flex items-center gap-4">
                    <Check className="w-6 h-6 text-emerald-400" />
                    <div>
                       <p className="font-black">Ready to Process {csvData.length} Records</p>
                       <p className="text-[10px] opacity-60 font-black uppercase tracking-widest">{batchInfo.label} • {batchInfo.period}</p>
                    </div>
                  </div>
                  <button onClick={() => setCsvData([])} className="text-xs font-black text-primary-400 hover:underline">Change File</button>
               </div>
               <div className="border border-slate-100 rounded-3xl overflow-hidden">
                 <table className="w-full text-left text-xs">
                   <thead className="bg-slate-50 border-b">
                     <tr className="text-slate-400 font-black uppercase tracking-widest">
                       <th className="px-6 py-4">ID</th>
                       <th className="px-6 py-4 text-right">Net Amount</th>
                       <th className="px-6 py-4">Remarks</th>
                     </tr>
                   </thead>
                   <tbody className="divide-y divide-slate-50">
                     {csvData.slice(0, 10).map((row, idx) => (
                       <tr key={idx}><td className="px-6 py-3 font-mono">{row.IdNumber}</td><td className="px-6 py-3 text-right font-black">₱{row.netAmountDue.toLocaleString()}</td><td className="px-6 py-3 italic text-slate-500">{row.description}</td></tr>
                     ))}
                   </tbody>
                 </table>
               </div>
            </div>
          )}
        </div>

        <div className="p-8 bg-slate-50 border-t border-slate-100 flex justify-end gap-4">
          <button onClick={onClose} className="px-8 py-3 text-sm font-black text-slate-500">Cancel</button>
          <button disabled={csvData.length === 0 || loading} onClick={handleBulkSubmit} className="px-12 py-3 bg-primary-600 text-white rounded-2xl font-black text-sm shadow-xl shadow-primary-200">
            {loading ? 'Processing...' : 'Post Records'}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default Payslips;
