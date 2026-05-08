import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { FileText, Plus, Search, Trash2, Upload, Download, Tag, Check, FileSpreadsheet, MessageSquare, Calendar, Eye, X, Edit2, Save, ChevronLeft, UserPlus, Filter, Sparkles, AlertCircle } from 'lucide-react';
import EmployeeModal from '../components/EmployeeModal';
import { useToast } from '../context/ToastContext';
import { motion, AnimatePresence } from 'framer-motion';

const OtherReceivables = () => {
  const { user } = useAuth();
  const toast = useToast();
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isManualOpen, setIsManualOpen] = useState(false);
  const [selectedBatch, setSelectedBatch] = useState(null);
  const [mainSearch, setMainSearch] = useState('');

  useEffect(() => { fetchBatches(); }, []);

  const fetchBatches = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/payslips/batches?type=Other Receivables');
      setBatches(res.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleDeleteBatch = async (id) => {
    if (!window.confirm('DANGER: Delete ENTIRE batch and all its records?')) return;
    try {
      await axios.delete(`/api/payslips/batch/${id}`);
      toast.success('Batch deleted');
      fetchBatches();
    } catch (err) { toast.error('Delete failed'); }
  };

  const downloadTemplate = () => {
    const headers = "employeeID,Amount,Tax,Voluntary_Deductions,NetAmountDue\n";
    const sample = "CDH-2023-278,5000.00,0,0,5000.00";
    const blob = new Blob([headers + sample], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'other_receivables_template.csv';
    a.click();
  };

  const filteredBatches = batches.filter(b => {
    const name = String(b.batchName || '').toLowerCase();
    const period = String(b.period || '').toLowerCase();
    const search = mainSearch.toLowerCase();
    return name.includes(search) || period.includes(search);
  });

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Other Receivables</h1>
          <p className="text-slate-500 font-medium text-sm">Ad-hoc payments grouped by batch</p>
        </div>
        <div className="flex gap-3">
          <button onClick={downloadTemplate} className="px-4 py-2 bg-slate-100 border border-slate-200 rounded-xl text-slate-600 font-bold flex items-center gap-2 hover:bg-slate-200 transition-all">
            <Download className="w-5 h-5" /> Template
          </button>
          {(user?.role === 'admin' || user?.role === 'uploader') && (
            <>
              <button onClick={() => setIsUploadOpen(true)} className="px-6 py-2 bg-white border-2 border-indigo-100 rounded-xl text-indigo-700 font-bold flex items-center gap-2 hover:bg-indigo-50 transition-all shadow-md">
                <Upload className="w-5 h-5" /> Bulk Upload
              </button>
              <button onClick={() => setIsManualOpen(true)} className="btn-primary flex items-center gap-2 shadow-lg shadow-primary-200 px-6">
                <Plus className="w-5 h-5" /> New Single Entry
              </button>
            </>
          )}
        </div>
      </div>

      <div className="relative max-w-md group">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-indigo-500 transition-colors" />
        <input 
          type="text" 
          placeholder="Search categories..." 
          className="w-full pl-12 pr-4 py-3 bg-white border-2 border-slate-100 rounded-[20px] font-bold focus:outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-50 transition-all shadow-sm"
          value={mainSearch}
          onChange={(e) => setMainSearch(e.target.value)}
        />
      </div>

      <div className="bg-white rounded-[40px] border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 text-slate-400 text-[10px] font-black uppercase tracking-widest border-b border-slate-100">
                <th className="px-8 py-5">Batch Category</th>
                <th className="px-8 py-5 text-right">Records</th>
                <th className="px-8 py-5 text-right">Total Net</th>
                <th className="px-8 py-5">Date Posted</th>
                <th className="px-8 py-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr><td colSpan="5" className="px-8 py-10 text-center text-slate-400">Loading batches...</td></tr>
              ) : filteredBatches.length === 0 ? (
                <tr><td colSpan="5" className="px-8 py-10 text-center text-slate-400 font-medium">No results found.</td></tr>
              ) : (
                filteredBatches.map((b) => (
                  <tr key={b.id} className="hover:bg-slate-50/50 group transition-all">
                    <td className="px-8 py-5">
                      <p className="font-bold text-slate-900">{b.batchName}</p>
                      <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">{b.period}</span>
                    </td>
                    <td className="px-8 py-5 text-right font-black text-slate-600">{b.recordCount}</td>
                    <td className="px-8 py-5 text-right">
                      <p className="font-black text-slate-900 text-lg">₱{b.totalAmount?.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                    </td>
                    <td className="px-8 py-5 text-xs font-bold text-slate-400">{new Date(b.uploadDate).toLocaleDateString()}</td>
                    <td className="px-8 py-5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => setSelectedBatch(b)} className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl hover:bg-indigo-600 hover:text-white transition-all shadow-sm flex items-center gap-1">
                          <Eye className="w-4 h-4" /> <span className="text-[10px] font-black uppercase">View</span>
                        </button>
                        {user?.role === 'admin' && (
                          <button onClick={() => handleDeleteBatch(b.id)} className="p-2.5 bg-red-50 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all shadow-sm">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <UploadModal isOpen={isUploadOpen} onClose={() => setIsUploadOpen(false)} onSuccess={fetchBatches} />
      <ManualEntryModal isOpen={isManualOpen} onClose={() => setIsManualOpen(false)} onSuccess={fetchBatches} />
      <BatchDetailsModal batch={selectedBatch} onClose={() => setSelectedBatch(null)} onDataChanged={fetchBatches} onDeleteBatch={handleDeleteBatch} />
    </div>
  );
};

const BatchDetailsModal = ({ batch, onClose, onDataChanged, onDeleteBatch }) => {
  const toast = useToast();
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [editingRecord, setEditingRecord] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showUnregisteredOnly, setShowUnregisteredOnly] = useState(false);
  const [isRegOpen, setIsRegOpen] = useState(false);
  const [regId, setRegId] = useState('');
  const recordsPerPage = 20;

  useEffect(() => {
    if (batch) { fetchRecords(); }
  }, [batch]);

  const fetchRecords = async () => {
    setLoading(true);
    const res = await axios.get(`/api/payslips?batchId=${batch.id}`);
    setRecords(res.data);
    setLoading(false);
  };

  const handleCleanup = async () => {
    if (!window.confirm('Delete all records with 0.00 Gross AND 0.00 Net?')) return;
    try {
      await axios.delete(`/api/payslips/batch/${batch.id}/cleanup`);
      toast.success('Cleanup successful');
      fetchRecords();
      onDataChanged();
    } catch (err) { toast.error('Cleanup failed'); }
  };

  const handleDeleteRecord = async (id) => {
    if (!window.confirm('Delete record?')) return;
    try {
      await axios.delete(`/api/payslips/${id}`);
      toast.success('Record deleted');
      setRecords(records.filter(r => r.id !== id));
      onDataChanged();
    } catch (err) { toast.error('Delete failed'); }
  };

  if (!batch) return null;

  // BULLETPROOF FILTERING LOGIC: Using numeric isVerified flag
  const filteredRecords = records.filter(r => {
    const isUnreg = r.isVerified === 0;
    if (showUnregisteredOnly && !isUnreg) return false;

    const search = searchTerm.toLowerCase();
    const fName = String(r.FullName || '').toLowerCase();
    const idStr = String(r.IdNumber || '').toLowerCase();

    return fName.includes(search) || idStr.includes(search);
  });

  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRecords = filteredRecords.slice(indexOfFirstRecord, indexOfLastRecord);
  const totalPages = Math.ceil(filteredRecords.length / recordsPerPage);

  const unregisteredCount = records.filter(r => r.isVerified === 0).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-[40px] w-full max-w-6xl shadow-2xl overflow-hidden flex flex-col h-[90vh]">
        <div className="p-8 border-b border-slate-100 grid grid-cols-1 md:grid-cols-3 items-center bg-slate-50/50 gap-4">
          <div>
            <h2 className="text-2xl font-black text-slate-900 leading-tight">{batch.batchName}</h2>
            <div className="flex items-center gap-2 mt-1">
               <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">{batch.period} • {records.length} Records</span>
               {unregisteredCount > 0 && (
                 <span className="px-2 py-0.5 bg-red-100 text-red-600 text-[9px] font-black rounded-full animate-pulse uppercase">
                   {unregisteredCount} Unregistered
                 </span>
               )}
            </div>
          </div>
          <div className="flex flex-col gap-2">
             <div className="relative w-full group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                <input 
                  type="text" 
                  placeholder="Search Employee..." 
                  className="w-full pl-11 pr-4 py-3 bg-white border-2 border-slate-200 rounded-2xl text-sm font-bold focus:outline-none focus:ring-4 focus:ring-indigo-50 focus:border-indigo-400 transition-all shadow-sm"
                  value={searchTerm}
                  onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                />
             </div>
             <button 
                onClick={() => {
                   setShowUnregisteredOnly(!showUnregisteredOnly);
                   setCurrentPage(1);
                }}
                className={`flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all border-2 ${showUnregisteredOnly ? 'bg-red-500 text-white border-red-500 shadow-lg shadow-red-200' : 'bg-white text-slate-400 border-slate-100'}`}
             >
                <Filter className="w-3 h-3" /> {showUnregisteredOnly ? 'Showing Unregistered Only' : 'Show All Records'}
             </button>
          </div>
          <div className="flex items-center justify-end gap-3">
             <button onClick={handleCleanup} className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl hover:bg-indigo-600 hover:text-white transition-all shadow-sm" title="Remove zero-value rows">
               <Sparkles className="w-4 h-4" />
             </button>
             <button onClick={() => { if(window.confirm('DELETE ENTIRE BATCH?')) { onDeleteBatch(batch.id); onClose(); } }} className="px-4 py-2 bg-red-50 text-red-600 rounded-xl text-[10px] font-black uppercase hover:bg-red-600 hover:text-white transition-all flex items-center gap-2">
               <Trash2 className="w-4 h-4" /> Delete Whole Batch
             </button>
             <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-900 transition-colors"><X className="w-6 h-6" /></button>
          </div>
        </div>
        <div className="p-0 overflow-y-auto flex-1">
           <table className="w-full text-left text-sm border-separate border-spacing-0">
             <thead className="bg-slate-50 sticky top-0 z-10 border-b">
               <tr className="text-slate-400 font-black uppercase tracking-widest text-[10px]">
                 <th className="px-8 py-4 border-b">Employee Info</th>
                 <th className="px-8 py-4 text-right border-b">Gross</th>
                 <th className="px-8 py-4 text-right border-b font-black text-slate-900">Net Due</th>
                 <th className="px-8 py-4 text-center border-b">Status</th>
                 <th className="px-8 py-4 text-right border-b">Actions</th>
               </tr>
             </thead>
             <tbody className="divide-y divide-slate-50">
               {loading ? (
                 <tr><td colSpan="6" className="px-8 py-10 text-center text-slate-400 font-bold">Loading...</td></tr>
               ) : currentRecords.length === 0 ? (
                 <tr><td colSpan="6" className="px-8 py-20 text-center text-slate-400 font-bold">No matching records found</td></tr>
               ) : currentRecords.map(r => {
                 const isUnreg = r.isVerified === 0;
                 return (
                   <tr key={r.id} className={`hover:bg-slate-50/50 transition-all text-xs group ${isUnreg ? 'bg-red-50/30' : ''}`}>
                     <td className="px-8 py-4">
                       <div className="flex items-center gap-2">
                         <p className={`font-bold ${isUnreg ? 'text-red-500' : 'text-slate-800'}`}>
                            {isUnreg ? 'NOT REGISTERED' : r.FullName}
                         </p>
                         {isUnreg && <AlertCircle className="w-3 h-3 text-red-400 animate-pulse" />}
                       </div>
                       <p className="text-[10px] text-slate-400 font-mono">{String(r.IdNumber || '')}</p>
                     </td>
                     <td className="px-8 py-4 text-right font-medium text-slate-500">₱{(parseFloat(r.amount) || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                     <td className="px-8 py-4 text-right font-black text-indigo-600 text-sm">₱{(parseFloat(r.netAmountDue) || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                     <td className="px-8 py-4 text-center">
                        {isUnreg ? (
                          <button onClick={() => { setRegId(r.IdNumber); setIsRegOpen(true); }} className="px-3 py-1 bg-red-100 text-red-600 rounded-full text-[9px] font-black uppercase hover:bg-red-600 hover:text-white transition-all flex items-center gap-1 mx-auto">
                            <UserPlus className="w-3 h-3" /> Register
                          </button>
                        ) : (
                           <div className="flex flex-col items-center gap-0.5">
                              <span className="px-3 py-1 bg-green-100 text-green-600 rounded-full text-[9px] font-black uppercase tracking-widest">Verified</span>
                              <span className="text-[8px] text-slate-400 font-bold uppercase">Record Linked</span>
                           </div>
                        )}
                     </td>
                     <td className="px-8 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button onClick={() => setEditingRecord(r)} className="p-2 text-slate-300 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"><Edit2 className="w-4 h-4" /></button>
                          <button onClick={() => handleDeleteRecord(r.id)} className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"><Trash2 className="w-4 h-4" /></button>
                        </div>
                     </td>
                   </tr>
                 );
               })}
             </tbody>
           </table>
        </div>

        <div className="p-6 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between">
           <p className="text-xs font-bold text-slate-400">Showing {indexOfFirstRecord + 1} to {Math.min(indexOfLastRecord, filteredRecords.length)} of {filteredRecords.length} records</p>
           <div className="flex gap-2">
              <button disabled={currentPage === 1} onClick={() => setCurrentPage(prev => prev - 1)} className="p-2 bg-white border border-slate-200 rounded-xl disabled:opacity-30"><ChevronLeft className="w-5 h-5" /></button>
              {[...Array(totalPages)].map((_, i) => (
                <button key={i} onClick={() => setCurrentPage(i + 1)} className={`w-10 h-10 rounded-xl font-black text-sm transition-all ${currentPage === i + 1 ? 'bg-indigo-600 text-white' : 'bg-white border border-slate-200 text-slate-400 hover:border-indigo-200 hover:text-indigo-600'}`}>
                  {i + 1}
                </button>
              ))}
              <button disabled={currentPage === totalPages || totalPages === 0} onClick={() => setCurrentPage(prev => prev + 1)} className="p-2 bg-white border border-slate-200 rounded-xl disabled:opacity-30 rotate-180"><ChevronLeft className="w-5 h-5" /></button>
           </div>
        </div>

        <EmployeeModal 
          isOpen={isRegOpen} 
          onClose={() => setIsRegOpen(false)} 
          onSuccess={() => {
            fetchRecords();
            onDataChanged();
          }}
          defaultId={regId}
        />
      </motion.div>

      <EditRecordModal 
        record={editingRecord} 
        onClose={() => setEditingRecord(null)} 
        onSuccess={(updated) => {
          setRecords(records.map(r => r.id === updated.id ? { ...r, ...updated } : r));
          onDataChanged();
        }} 
      />
    </div>
  );
};

const EditRecordModal = ({ record, onClose, onSuccess }) => {
  const toast = useToast();
  const [formData, setFormData] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (record) setFormData({ ...record });
  }, [record]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await axios.put(`/api/payslips/${record.id}`, formData);
      toast.success('Record updated');
      onSuccess(formData);
      onClose();
    } catch (err) { toast.error('Update failed'); }
    finally { setSaving(false); }
  };

  if (!record || !formData) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-[32px] w-full max-w-lg shadow-2xl overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
           <h3 className="text-xl font-black text-slate-900">Edit Record</h3>
           <button onClick={onClose} className="text-slate-400 hover:text-slate-900"><X className="w-6 h-6" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-8 space-y-5">
           <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
              <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Employee</p>
              <p className="font-bold text-slate-800">{String(record.FullName || 'Unregistered')}</p>
              <p className="text-[10px] text-slate-400 font-mono">{String(record.IdNumber || '')}</p>
           </div>
           <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Gross Amount</label>
                <input required type="number" step="0.01" className="input-field" value={formData.amount} onChange={(e) => setFormData({...formData, amount: e.target.value})} />
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Net Due</label>
                <input required type="number" step="0.01" className="input-field" value={formData.netAmountDue} onChange={(e) => setFormData({...formData, netAmountDue: e.target.value})} />
              </div>
           </div>
           <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Tax</label>
                <input required type="number" step="0.01" className="input-field text-red-500" value={formData.tax} onChange={(e) => setFormData({...formData, tax: e.target.value})} />
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Deductions</label>
                <input required type="number" step="0.01" className="input-field text-red-500" value={formData.voluntaryDeductions} onChange={(e) => setFormData({...formData, voluntaryDeductions: e.target.value})} />
              </div>
           </div>
           <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Remarks</label>
              <textarea rows="2" className="input-field resize-none py-4" value={formData.description || ''} onChange={(e) => setFormData({...formData, description: e.target.value})} />
           </div>
           <div className="flex justify-end gap-3 pt-4">
              <button type="button" onClick={onClose} className="px-6 py-3 font-bold text-slate-400 hover:text-slate-900">Cancel</button>
              <button type="submit" disabled={saving} className="px-10 py-3 bg-indigo-600 text-white rounded-2xl font-black shadow-lg shadow-primary-200">
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
           </div>
        </form>
      </motion.div>
    </div>
  );
};

const ManualEntryModal = ({ isOpen, onClose, onSuccess }) => {
  const toast = useToast();
  const [formData, setFormData] = useState({ IdNumber: '', amount: '', tax: '0', voluntaryDeductions: '0', netAmountDue: '0', period: new Date().toISOString().split('T')[0], description: '', subType: '' });
  const [labels, setLabels] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      axios.get('/api/batch-labels').then(res => {
        const active = res.data.filter(l => l.status === 'active');
        setLabels(active);
        if (active.length > 0) setFormData(prev => ({ ...prev, subType: active[0].label }));
      });
    }
  }, [isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post('/api/payslips/bulk', { 
        payslips: [formData], 
        globalType: 'Other Receivables',
        globalSubType: formData.subType,
        period: formData.period,
        batchName: formData.subType + " (Single Entry)"
      });
      toast.success('Entry added');
      onSuccess();
      onClose();
    } catch (err) { toast.error('Save failed'); }
    finally { setLoading(false); }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-[40px] w-full max-w-xl shadow-2xl overflow-hidden">
        <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Single Entry</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-900">&times;</button>
        </div>
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
           <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Employee ID</label>
                <input required className="input-field" placeholder="EMP-001" value={formData.IdNumber} onChange={(e) => setFormData({...formData, IdNumber: e.target.value})} />
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Category</label>
                <select className="input-field" value={formData.subType} onChange={(e) => setFormData({...formData, subType: e.target.value})}>
                   {labels.map(l => <option key={l.id} value={l.label}>{l.label}</option>)}
                </select>
              </div>
           </div>
           <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Gross Amount</label>
                <input required type="number" step="0.01" className="input-field" value={formData.amount} onChange={(e) => setFormData({...formData, amount: e.target.value})} />
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Net Due</label>
                <input required type="number" step="0.01" className="input-field" value={formData.netAmountDue} onChange={(e) => setFormData({...formData, netAmountDue: e.target.value})} />
              </div>
           </div>
           <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Tax</label>
                <input required type="number" step="0.01" className="input-field" value={formData.tax} onChange={(e) => setFormData({...formData, tax: e.target.value})} />
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Deductions</label>
                <input required type="number" step="0.01" className="input-field" value={formData.voluntaryDeductions} onChange={(e) => setFormData({...formData, voluntaryDeductions: e.target.value})} />
              </div>
           </div>
           <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Remarks</label>
              <textarea rows="2" className="input-field resize-none py-4" placeholder="Description..." value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} />
           </div>
           <div className="flex justify-end gap-4 pt-4">
              <button type="button" onClick={onClose} className="px-6 py-3 text-sm font-black text-slate-500">Cancel</button>
              <button type="submit" disabled={loading} className="px-10 py-3 bg-indigo-600 text-white rounded-2xl font-black text-sm">Save Entry</button>
           </div>
        </form>
      </motion.div>
    </div>
  );
};

const UploadModal = ({ isOpen, onClose, onSuccess }) => {
  const toast = useToast();
  const [csvData, setCsvData] = useState([]);
  const [labels, setLabels] = useState([]);
  const [loading, setLoading] = useState(false);
  const [subType, setSubType] = useState('');
  const [specificDate, setSpecificDate] = useState(new Date().toISOString().split('T')[0]);
  const [globalRemarks, setGlobalRemarks] = useState('');
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
        axios.get('/api/batch-labels').then(res => {
            const active = res.data.filter(l => l.status === 'active');
            setLabels(active);
            if (active.length > 0) setSubType(active[0].label);
        });
    }
  }, [isOpen]);

  const cleanNumber = (val) => {
    if (!val) return 0;
    const cleaned = val.toString().replace(/[^0-9.-]/g, '');
    return parseFloat(cleaned) || 0;
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const rows = event.target.result.split('\n').filter(r => r.trim() !== '');
      const parsed = rows.slice(1).map(row => {
        const col = [];
        let cur = "";
        let inQuote = false;
        for (let i = 0; i < row.length; i++) {
          const char = row[i];
          if (char === '"') inQuote = !inQuote;
          else if (char === ',' && !inQuote) { col.push(cur); cur = ""; }
          else cur += char;
        }
        col.push(cur);
        const clean = (val) => (val || '').trim();
        const gross = cleanNumber(clean(col[1]));
        const tax = cleanNumber(clean(col[2]));
        const ded = cleanNumber(clean(col[3]));
        const net = cleanNumber(clean(col[4])); 
        return { IdNumber: clean(col[0]), amount: gross, tax: tax, voluntaryDeductions: ded, netAmountDue: net };
      });
      setCsvData(parsed);
    };
    reader.readAsText(file);
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await axios.post('/api/payslips/bulk', { 
        payslips: csvData.map(p => ({ ...p, description: globalRemarks })),
        globalType: 'Other Receivables',
        globalSubType: subType,
        period: specificDate
      });
      toast.success(`Uploaded ${csvData.length} records`);
      onSuccess();
      onClose();
    } catch (err) { toast.error('Upload failed'); }
    finally { setLoading(false); }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-[40px] w-full max-w-2xl shadow-2xl overflow-hidden">
        <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <h2 className="text-2xl font-black text-slate-900">Upload Receivables Batch</h2>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-900">&times;</button>
        </div>
        <div className="p-8 space-y-6">
           <div className="grid grid-cols-2 gap-6">
             <div>
               <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Category</label>
               <select className="input-field" value={subType} onChange={(e) => setSubType(e.target.value)}>
                  {labels.map(l => <option key={l.id} value={l.label}>{l.label}</option>)}
               </select>
             </div>
             <div>
               <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Date</label>
               <input type="date" className="input-field" value={specificDate} onChange={(e) => setSpecificDate(e.target.value)} />
             </div>
           </div>
           <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Batch Remarks</label>
              <textarea rows="2" className="input-field resize-none py-4" value={globalRemarks} onChange={(e) => setGlobalRemarks(e.target.value)} />
           </div>
           {csvData.length === 0 ? (
            <div onClick={() => fileInputRef.current.click()} className="border-4 border-dashed border-slate-100 rounded-[32px] p-20 text-center hover:border-indigo-200 hover:bg-indigo-50/30 transition-all cursor-pointer group">
              <Upload className="w-12 h-12 text-slate-200 mx-auto mb-4" />
              <p className="text-lg font-bold text-slate-600">Select CSV File</p>
              <input type="file" accept=".csv" className="hidden" ref={fileInputRef} onChange={handleFileUpload} />
            </div>
           ) : (
            <div className="bg-slate-900 p-6 rounded-3xl text-white flex justify-between items-center shadow-lg">
               <p className="text-2xl font-black">{String(csvData.length)} Records Detected</p>
               <button onClick={() => setCsvData([])} className="text-sm font-bold text-indigo-400 hover:underline">Change</button>
            </div>
           )}
           <div className="flex justify-end gap-4 pt-4">
              <button onClick={onClose} className="px-6 py-3 text-sm font-black text-slate-500 hover:text-slate-900 transition-colors">Cancel</button>
              <button disabled={csvData.length === 0 || loading} onClick={handleSubmit} className="px-12 py-3 bg-indigo-600 text-white rounded-2xl font-black shadow-xl shadow-indigo-200">Upload Batch</button>
           </div>
        </div>
      </motion.div>
    </div>
  );
};

export default OtherReceivables;
