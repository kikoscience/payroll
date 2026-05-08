import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Layers, Upload, Download, ChevronRight, Trash2, Check, FileSpreadsheet, Eye, X, Edit2, Save, ChevronLeft, Search, AlertCircle, TrendingUp, ShieldAlert } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const PayrollBatches = () => {
  const { user } = useAuth();
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [selectedBatch, setSelectedBatch] = useState(null);
  const [mainSearch, setMainSearch] = useState('');

  useEffect(() => { fetchBatches(); }, []);

  const fetchBatches = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/payslips/batches?type=Payroll');
      setBatches(res.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleDeleteBatch = async (id) => {
    if (!window.confirm('WARNING: Delete ENTIRE batch and all its records?')) return;
    try {
      await axios.delete(`/api/payslips/batch/${id}`);
      fetchBatches();
    } catch (err) { alert('Error deleting'); }
  };

  const downloadTemplate = () => {
    const headers = "employee_id,salaries_si,due_to_others,absences,pera,sa,la,hazard_pay,night_shift_differential,gross_amount,due_to_bir,gsis_ps,gsis_conso_loan,gsis_eml,gsis_policy_loan,gfal,gsis_mpl,gsis_mpl_lite,gsis_cpl,pagibig_ps,pagibig_mp2,pagibig_mpl,pagibig_cal,phic_ps,lbp,due_from_others,total_deductions,net_amount\n";
    const sample = "CDH-2023-278,9892.08,0,0,2000,0,0,0,0,11892.08,601.29,100,0,0,0,0,0,0,0,100,0,0,0,200,0,0,1001.29,10890.79";
    const blob = new Blob([headers + sample], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'detailed_payroll_template.csv';
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
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Monthly Payroll</h1>
          <p className="text-slate-500 font-medium text-sm">Detailed institutional salary management</p>
        </div>
        <div className="flex gap-3">
          <button onClick={downloadTemplate} className="px-4 py-2 bg-slate-100 border border-slate-200 rounded-xl text-slate-600 font-bold flex items-center gap-2 hover:bg-slate-200 transition-all">
            <Download className="w-5 h-5" /> Template
          </button>
          {(user?.role === 'admin' || user?.role === 'uploader') && (
            <button onClick={() => setIsUploadOpen(true)} className="btn-primary flex items-center gap-2 shadow-lg shadow-primary-200 px-6">
              <Upload className="w-5 h-5" /> Upload Detailed CSV
            </button>
          )}
        </div>
      </div>

      <div className="relative max-w-md group">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-primary-500 transition-colors" />
        <input 
          type="text" 
          placeholder="Search batches..." 
          className="w-full pl-12 pr-4 py-3 bg-white border-2 border-slate-100 rounded-[20px] font-bold focus:outline-none focus:border-primary-400 focus:ring-4 focus:ring-primary-50 transition-all shadow-sm"
          value={mainSearch}
          onChange={(e) => setMainSearch(e.target.value)}
        />
      </div>

      <div className="bg-white rounded-[32px] border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 text-slate-400 text-[10px] font-black uppercase tracking-widest border-b border-slate-100">
                <th className="px-8 py-5">Batch Name</th>
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
                      <span className="text-[10px] font-black text-primary-600 uppercase tracking-widest">{b.period}</span>
                    </td>
                    <td className="px-8 py-5 text-right font-black text-slate-600">{b.recordCount}</td>
                    <td className="px-8 py-5 text-right">
                      <p className="font-black text-slate-900 text-lg">₱{b.totalAmount?.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                    </td>
                    <td className="px-8 py-5 text-xs font-bold text-slate-400">{new Date(b.uploadDate).toLocaleDateString()}</td>
                    <td className="px-8 py-5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => setSelectedBatch(b)} className="p-2.5 bg-primary-50 text-primary-600 rounded-xl hover:bg-primary-600 hover:text-white transition-all shadow-sm flex items-center gap-1">
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

      <BatchUploadModal isOpen={isUploadOpen} onClose={() => setIsUploadOpen(false)} onSuccess={fetchBatches} />
      <BatchDetailsModal batch={selectedBatch} onClose={() => setSelectedBatch(null)} onDataChanged={fetchBatches} onDeleteBatch={handleDeleteBatch} />
    </div>
  );
};

const BatchDetailsModal = ({ batch, onClose, onDataChanged, onDeleteBatch }) => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [editingRecord, setEditingRecord] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const recordsPerPage = 20;

  useEffect(() => {
    if (batch) {
      setLoading(true);
      axios.get(`/api/payslips?batchId=${batch.id}`).then(res => {
        setRecords(res.data);
        setLoading(false);
      });
    }
  }, [batch]);

  const handleDeleteRecord = async (id) => {
    if (!window.confirm('Delete record?')) return;
    try {
      await axios.delete(`/api/payslips/${id}`);
      setRecords(records.filter(r => r.id !== id));
      onDataChanged(); 
    } catch (err) { alert('Error deleting'); }
  };

  if (!batch) return null;

  const filteredRecords = records.filter(r => {
    const fullName = String(r.FullName || '').toLowerCase();
    const idNum = String(r.IdNumber || '').toLowerCase();
    const search = searchTerm.toLowerCase();
    return fullName.includes(search) || idNum.includes(search);
  });

  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRecords = filteredRecords.slice(indexOfFirstRecord, indexOfLastRecord);
  const totalPages = Math.ceil(filteredRecords.length / recordsPerPage);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-[40px] w-full max-w-6xl shadow-2xl overflow-hidden flex flex-col h-[90vh]">
        <div className="p-8 border-b border-slate-100 grid grid-cols-3 items-center bg-slate-50/50">
          <div>
            <h2 className="text-2xl font-black text-slate-900 leading-tight">{batch.batchName}</h2>
            <p className="text-[10px] font-black text-primary-600 uppercase tracking-widest">{batch.period} • {records.length} Total Records</p>
          </div>
          <div className="flex justify-center">
             <div className="relative w-full max-w-md group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-primary-500 transition-colors" />
                <input 
                  type="text" 
                  placeholder="Search Employee..." 
                  className="w-full pl-11 pr-4 py-3 bg-white border-2 border-slate-200 rounded-2xl text-sm font-bold focus:outline-none focus:ring-4 focus:ring-primary-50 focus:border-primary-400 transition-all shadow-sm"
                  value={searchTerm}
                  onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                />
             </div>
          </div>
          <div className="flex items-center justify-end gap-4">
             <button onClick={() => { if(window.confirm('DELETE ENTIRE BATCH?')) { onDeleteBatch(batch.id); onClose(); } }} className="px-4 py-2 bg-red-50 text-red-600 rounded-xl text-[10px] font-black uppercase hover:bg-red-600 hover:text-white transition-all flex items-center gap-2">
               <Trash2 className="w-4 h-4" /> Delete Batch
             </button>
             <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-900 transition-colors"><X className="w-6 h-6" /></button>
          </div>
        </div>

        <div className="p-0 overflow-y-auto flex-1">
           <table className="w-full text-left text-sm border-separate border-spacing-0">
             <thead className="bg-slate-50 sticky top-0 z-10 border-b">
               <tr className="text-slate-400 font-black uppercase tracking-widest text-[10px]">
                 <th className="px-8 py-4 border-b">Employee</th>
                 <th className="px-8 py-4 text-right border-b">Gross Amount</th>
                 <th className="px-8 py-4 text-right border-b">Total Deductions</th>
                 <th className="px-8 py-4 text-right border-b font-black text-slate-900">Net Amount</th>
                 <th className="px-8 py-4 text-right border-b">Actions</th>
               </tr>
             </thead>
             <tbody className="divide-y divide-slate-50">
               {loading ? (
                 <tr><td colSpan="5" className="px-8 py-10 text-center text-slate-400 font-bold italic">Loading...</td></tr>
               ) : filteredRecords.length === 0 ? (
                 <tr><td colSpan="5" className="px-8 py-10 text-center text-slate-400 font-bold italic">No results found</td></tr>
               ) : currentRecords.map(r => (
                 <tr key={r.id} className="hover:bg-slate-50/50 transition-all text-xs group">
                   <td className="px-8 py-4">
                     <p className="font-bold text-slate-800">{r.FullName || 'Unknown'}</p>
                     <p className="text-[10px] text-slate-400 font-mono">{r.IdNumber}</p>
                   </td>
                   <td className="px-8 py-4 text-right font-medium text-slate-600">₱{parseFloat(r.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                   <td className="px-8 py-4 text-right font-medium text-red-400">₱{parseFloat(r.voluntaryDeductions).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                   <td className="px-8 py-4 text-right font-black text-primary-600 text-sm">₱{parseFloat(r.netAmountDue).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                   <td className="px-8 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => setEditingRecord(r)} className="p-2 text-slate-300 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"><Edit2 className="w-4 h-4" /></button>
                        <button onClick={() => handleDeleteRecord(r.id)} className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"><Trash2 className="w-4 h-4" /></button>
                      </div>
                   </td>
                 </tr>
               ))}
             </tbody>
           </table>
        </div>

        <div className="p-6 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between">
           <p className="text-xs font-bold text-slate-400">Showing {indexOfFirstRecord + 1} to {Math.min(indexOfLastRecord, filteredRecords.length)} of {filteredRecords.length} records</p>
           <div className="flex gap-2">
              <button disabled={currentPage === 1} onClick={() => setCurrentPage(prev => prev - 1)} className="p-2 bg-white border border-slate-200 rounded-xl disabled:opacity-30"><ChevronLeft className="w-5 h-5" /></button>
              {[...Array(totalPages)].map((_, i) => (
                <button key={i} onClick={() => setCurrentPage(i + 1)} className={`w-10 h-10 rounded-xl font-black text-sm transition-all ${currentPage === i + 1 ? 'bg-primary-600 text-white' : 'bg-white border border-slate-200 text-slate-400 hover:border-primary-200 hover:text-primary-600'}`}>
                  {i + 1}
                </button>
              ))}
              <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(prev => prev + 1)} className="p-2 bg-white border border-slate-200 rounded-xl disabled:opacity-30 rotate-180"><ChevronLeft className="w-5 h-5" /></button>
           </div>
        </div>
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
      onSuccess(formData);
      onClose();
    } catch (err) { alert('Save failed'); }
    finally { setSaving(false); }
  };

  if (!record || !formData) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-[40px] w-full max-w-5xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
           <div>
             <h3 className="text-xl font-black text-slate-900">Master Record Editor</h3>
             <p className="text-xs font-bold text-slate-400">{record.FullName} • {record.IdNumber}</p>
           </div>
           <button onClick={onClose} className="text-slate-400 hover:text-slate-900 transition-colors"><X className="w-6 h-6" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-8 space-y-8 overflow-y-auto flex-1">
           <div>
              <div className="flex items-center gap-2 mb-6">
                 <div className="p-2 bg-green-50 text-green-600 rounded-lg"><TrendingUp className="w-5 h-5" /></div>
                 <h4 className="font-black text-slate-800 uppercase tracking-widest text-xs">Earnings & Adjustments</h4>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                 {[
                   { label: 'Salary SI', key: 'salaries_si' },
                   { label: 'Due to Others', key: 'due_to_others_earnings' },
                   { label: 'Absences', key: 'absences', color: 'text-red-500' },
                   { label: 'PERA', key: 'pera' },
                   { label: 'SA', key: 'sa' },
                   { label: 'LA', key: 'la' },
                   { label: 'Hazard Pay', key: 'hazard_pay' },
                   { label: 'Night Diff', key: 'night_shift_differential' },
                 ].map(f => (
                   <div key={f.key}>
                     <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">{f.label}</label>
                     <input type="number" step="0.01" className={`input-field text-xs ${f.color || ''}`} value={formData[f.key]} onChange={(e) => setFormData({...formData, [f.key]: e.target.value})} />
                   </div>
                 ))}
                 <div className="col-span-2">
                    <label className="block text-[9px] font-black text-primary-600 uppercase tracking-widest mb-1">Gross Amount (Total Earnings)</label>
                    <input type="number" step="0.01" className="input-field bg-primary-50 text-primary-700 font-black border-primary-100" value={formData.amount} onChange={(e) => setFormData({...formData, amount: e.target.value})} />
                 </div>
              </div>
           </div>

           <div>
              <div className="flex items-center gap-2 mb-6">
                 <div className="p-2 bg-red-50 text-red-600 rounded-lg"><ShieldAlert className="w-5 h-5" /></div>
                 <h4 className="font-black text-slate-800 uppercase tracking-widest text-xs">Government & Loan Deductions</h4>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                 {[
                   { label: 'Due to BIR (Tax)', key: 'tax' },
                   { label: 'GSIS PS', key: 'gsis_ps' },
                   { label: 'GSIS Conso', key: 'gsis_conso_loan' },
                   { label: 'GSIS EML', key: 'gsis_eml' },
                   { label: 'GSIS Policy', key: 'gsis_policy_loan' },
                   { label: 'GFAL', key: 'gfal' },
                   { label: 'GSIS MPL', key: 'gsis_mpl' },
                   { label: 'GSIS MPL Lite', key: 'gsis_mpl_lite' },
                   { label: 'GSIS CPL', key: 'gsis_cpl' },
                   { label: 'Pag-IBIG PS', key: 'pagibig_ps' },
                   { label: 'Pag-IBIG MP2', key: 'pagibig_mp2' },
                   { label: 'Pag-IBIG MPL', key: 'pagibig_mpl' },
                   { label: 'Pag-IBIG Calamity', key: 'pagibig_cal' },
                   { label: 'PHIC PS', key: 'phic_ps' },
                   { label: 'LBP', key: 'lbp' },
                   { label: 'Due From Others', key: 'due_from_others' },
                 ].map(f => (
                   <div key={f.key}>
                     <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">{f.label}</label>
                     <input type="number" step="0.01" className="input-field text-xs text-red-500" value={formData[f.key]} onChange={(e) => setFormData({...formData, [f.key]: e.target.value})} />
                   </div>
                 ))}
                 <div className="col-span-2">
                    <label className="block text-[9px] font-black text-red-600 uppercase tracking-widest mb-1">Total Deductions</label>
                    <input type="number" step="0.01" className="input-field bg-red-50 text-red-700 font-black border-red-100" value={formData.voluntaryDeductions} onChange={(e) => setFormData({...formData, voluntaryDeductions: e.target.value})} />
                 </div>
              </div>
           </div>

           <div className="bg-slate-900 p-8 rounded-[32px] shadow-xl text-white flex flex-col md:flex-row justify-between items-center gap-8">
              <div className="flex-1 w-full">
                 <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Final Net Amount Due</label>
                 <input type="number" step="0.01" className="w-full bg-transparent text-4xl font-black outline-none border-b-2 border-white/10 focus:border-primary-500 transition-all pb-2" value={formData.netAmountDue} onChange={(e) => setFormData({...formData, netAmountDue: e.target.value})} />
              </div>
              <div className="flex-1 w-full">
                 <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Remarks</label>
                 <textarea rows="1" className="w-full bg-white/5 rounded-xl p-4 text-sm outline-none border border-white/10 focus:border-primary-500 transition-all resize-none" value={formData.description || ''} onChange={(e) => setFormData({...formData, description: e.target.value})} />
              </div>
           </div>
        </form>
        <div className="p-8 border-t border-slate-100 flex justify-end gap-4 bg-slate-50/50">
           <button type="button" onClick={onClose} className="px-8 py-3 font-bold text-slate-400">Cancel</button>
           <button type="button" onClick={handleSubmit} disabled={saving} className="px-12 py-3 bg-primary-600 text-white rounded-2xl font-black shadow-xl shadow-primary-200">
             {saving ? 'Saving...' : 'Commit Updates'}
           </button>
        </div>
      </motion.div>
    </div>
  );
};

const BatchUploadModal = ({ isOpen, onClose, onSuccess }) => {
  const [csvData, setCsvData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [batchInfo, setBatchInfo] = useState({ batchName: 'Monthly Salary', period: new Date().toISOString().slice(0, 7), remarks: '' });
  const fileInputRef = useRef(null);

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
        
        return {
          IdNumber: clean(col[0]),
          salaries_si: cleanNumber(col[1]),
          due_to_others: cleanNumber(col[2]),
          absences: cleanNumber(col[3]),
          pera: cleanNumber(col[4]),
          sa: cleanNumber(col[5]),
          la: cleanNumber(col[6]),
          hazard_pay: cleanNumber(col[7]),
          night_shift_differential: cleanNumber(col[8]),
          amount: cleanNumber(col[9]),
          tax: cleanNumber(col[10]),
          gsis_ps: cleanNumber(col[11]),
          gsis_conso_loan: cleanNumber(col[12]),
          gsis_eml: cleanNumber(col[13]),
          gsis_policy_loan: cleanNumber(col[14]),
          gfal: cleanNumber(col[15]),
          gsis_mpl: cleanNumber(col[16]),
          gsis_mpl_lite: cleanNumber(col[17]),
          gsis_cpl: cleanNumber(col[18]),
          pagibig_ps: cleanNumber(col[19]),
          pagibig_mp2: cleanNumber(col[20]),
          pagibig_mpl: cleanNumber(col[21]),
          pagibig_cal: cleanNumber(col[22]),
          phic_ps: cleanNumber(col[23]),
          lbp: cleanNumber(col[24]),
          due_from_others: cleanNumber(col[25]),
          voluntaryDeductions: cleanNumber(col[26]),
          netAmountDue: cleanNumber(col[27])
        };
      });
      setCsvData(parsed);
    };
    reader.readAsText(file);
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await axios.post('/api/payslips/bulk', { 
        payslips: csvData, 
        batchName: batchInfo.batchName, 
        period: batchInfo.period,
        globalType: 'Payroll',
        globalSubType: 'Salary'
      });
      onSuccess();
      onClose();
    } catch (err) { alert('Upload failed'); }
    finally { setLoading(false); }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-[40px] w-full max-w-4xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <h2 className="text-2xl font-black text-slate-900">Upload Detailed Payroll</h2>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-900 transition-colors"><X className="w-6 h-6" /></button>
        </div>
        <div className="p-8 space-y-6 overflow-y-auto">
           <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Batch Name</label>
                <input type="text" className="input-field" value={batchInfo.batchName} onChange={(e) => setBatchInfo({...batchInfo, batchName: e.target.value})} />
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Payroll Month</label>
                <input type="month" className="input-field" value={batchInfo.period} onChange={(e) => setBatchInfo({...batchInfo, period: e.target.value})} />
              </div>
           </div>

           {csvData.length === 0 ? (
            <div onClick={() => fileInputRef.current.click()} className="border-4 border-dashed border-slate-100 rounded-[32px] p-20 text-center hover:border-primary-200 hover:bg-primary-50/30 transition-all cursor-pointer group">
              <Upload className="w-12 h-12 text-slate-200 mx-auto mb-4" />
              <p className="text-lg font-bold text-slate-600">Select 28-Column CSV File</p>
              <input type="file" accept=".csv" className="hidden" ref={fileInputRef} onChange={handleFileUpload} />
            </div>
           ) : (
            <div className="space-y-4">
               <div className="bg-primary-600 p-6 rounded-3xl text-white shadow-lg">
                  <p className="text-2xl font-black">{csvData.length} Detailed Records Found</p>
               </div>
               <div className="border border-slate-100 rounded-3xl overflow-hidden overflow-x-auto">
                  <table className="w-full text-left text-[10px]">
                     <thead className="bg-slate-50 text-slate-400 font-bold uppercase border-b border-slate-100">
                        <tr>
                           <th className="px-4 py-2">ID</th>
                           <th className="px-4 py-2">Salary</th>
                           <th className="px-4 py-2">GSIS PS</th>
                           <th className="px-4 py-2">PHIC PS</th>
                           <th className="px-4 py-2">Total Ded.</th>
                           <th className="px-4 py-2">Net Due</th>
                        </tr>
                     </thead>
                     <tbody className="divide-y divide-slate-50">
                        {csvData.slice(0, 3).map((row, i) => (
                           <tr key={i} className="bg-white">
                              <td className="px-4 py-2 font-black">{row.IdNumber}</td>
                              <td className="px-4 py-2">₱{row.salaries_si.toLocaleString()}</td>
                              <td className="px-4 py-2">₱{row.gsis_ps.toLocaleString()}</td>
                              <td className="px-4 py-2">₱{row.phic_ps.toLocaleString()}</td>
                              <td className="px-4 py-2 text-red-400 font-bold">₱{row.voluntaryDeductions.toLocaleString()}</td>
                              <td className="px-4 py-2 font-black text-primary-600">₱{row.netAmountDue.toLocaleString()}</td>
                           </tr>
                        ))}
                     </tbody>
                  </table>
               </div>
            </div>
           )}
        </div>
        <div className="p-8 border-t border-slate-100 bg-white flex justify-end gap-4">
           <button onClick={onClose} className="px-6 py-3 font-bold text-slate-400 hover:text-slate-900 transition-colors">Cancel</button>
           <button disabled={csvData.length === 0 || loading} onClick={handleSubmit} className="px-12 py-3 bg-primary-600 text-white rounded-2xl font-black">Post Detailed Payroll</button>
        </div>
      </motion.div>
    </div>
  );
};

export default PayrollBatches;
