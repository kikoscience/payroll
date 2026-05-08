import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { FileText, Printer, Search, Calendar, Wallet, DollarSign, X, CheckCircle, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import PrintablePayslip from '../components/PrintablePayslip';

const PayrollTasks = () => {
  const { user } = useAuth();
  const toast = useToast();
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRecord, setSelectedRecord] = useState(null);

  useEffect(() => {
    fetchMyRecords();
  }, []);

  const fetchMyRecords = async () => {
    try {
      const res = await axios.get('/api/payslips/my-records');
      setRecords(res.data);
    } catch (err) {
      toast.error('Error fetching your records');
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = (record) => {
    setSelectedRecord(record);
    // Give it a tiny delay to ensure modal is rendered
    setTimeout(() => {
      window.print();
    }, 500);
  };

  const filteredRecords = records.filter(r => 
    String(r.batchName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    String(r.period || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    String(r.subType || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 print:p-0">
      <div className="print:hidden">
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Payroll & Receivables</h1>
        <p className="text-slate-500 font-medium">Access and print your official disbursement records</p>
      </div>

      {/* Search & Stats */}
      <div className="flex flex-col md:flex-row gap-6 print:hidden">
        <div className="relative flex-1 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-primary-500 transition-colors" />
          <input 
            type="text" 
            placeholder="Search by period, batch name, or type..." 
            className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-3xl font-bold focus:outline-none focus:ring-4 focus:ring-primary-500/10 transition-all shadow-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Records Table */}
      <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden print:hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 text-slate-400 text-[10px] font-black uppercase tracking-widest border-b border-slate-100">
                <th className="px-8 py-6">Disbursement Item</th>
                <th className="px-8 py-6">Period</th>
                <th className="px-8 py-6">Type</th>
                <th className="px-8 py-6 text-right">Net Amount</th>
                <th className="px-8 py-6 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr><td colSpan="5" className="px-8 py-12 text-center text-slate-400 font-bold">Fetching your history...</td></tr>
              ) : filteredRecords.length === 0 ? (
                <tr><td colSpan="5" className="px-8 py-12 text-center text-slate-400 font-medium">No disbursement records found.</td></tr>
              ) : (
                filteredRecords.map((r, i) => (
                  <tr key={r.id} className="hover:bg-slate-50/50 group transition-all">
                    <td className="px-8 py-5">
                       <div className="flex items-center gap-4">
                          <div className={`p-3 rounded-2xl ${r.batchType === 'Payroll' ? 'bg-emerald-50 text-emerald-600' : 'bg-indigo-50 text-indigo-600'}`}>
                             {r.batchType === 'Payroll' ? <Wallet className="w-5 h-5" /> : <DollarSign className="w-5 h-5" />}
                          </div>
                          <div>
                             <p className="font-black text-slate-900 leading-tight">{r.batchName}</p>
                             <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Posted on {new Date(r.postedDate).toLocaleDateString()}</p>
                          </div>
                       </div>
                    </td>
                    <td className="px-8 py-5 font-bold text-slate-600">{r.period}</td>
                    <td className="px-8 py-5">
                       <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${r.batchType === 'Payroll' ? 'bg-emerald-100 text-emerald-700' : 'bg-indigo-100 text-indigo-700'}`}>
                          {r.batchType === 'Payroll' ? 'Monthly' : r.subType || 'Other'}
                       </span>
                    </td>
                    <td className="px-8 py-5 text-right font-black text-slate-900 text-lg">
                       ₱{parseFloat(r.netAmountDue).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-8 py-5 text-center">
                       <button 
                         onClick={() => setSelectedRecord(r)}
                         className="p-3 bg-slate-900 text-white rounded-2xl hover:bg-primary-600 transition-all shadow-lg shadow-slate-200 flex items-center justify-center mx-auto"
                       >
                         <Printer className="w-5 h-5" />
                       </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Print Preview Modal */}
      <AnimatePresence>
        {selectedRecord && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm print:bg-white print:p-0 print:block">
             <motion.div 
               initial={{ opacity: 0, scale: 0.9 }}
               animate={{ opacity: 1, scale: 1 }}
               exit={{ opacity: 0, scale: 0.9 }}
               className="bg-white rounded-[40px] w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl print:shadow-none print:max-h-none print:rounded-none print:w-full print:m-0"
             >
                <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 print:hidden">
                   <div>
                      <h2 className="text-2xl font-black text-slate-900 tracking-tight">Print Preview</h2>
                      <p className="text-sm font-medium text-slate-500">Official Payslip Generation</p>
                   </div>
                   <div className="flex gap-3">
                      <button 
                        onClick={() => window.print()}
                        className="px-8 py-3 bg-primary-600 text-white rounded-2xl font-black text-sm flex items-center gap-2 shadow-lg shadow-primary-200"
                      >
                        <Printer className="w-5 h-5" /> Print Now
                      </button>
                      <button onClick={() => setSelectedRecord(null)} className="p-3 text-slate-400 hover:text-slate-900 transition-colors">
                        <X className="w-8 h-8" />
                      </button>
                   </div>
                </div>
                <div className="flex-1 overflow-y-auto p-12 bg-slate-100 print:bg-white print:p-0">
                   <div className="print:m-0">
                      <PrintablePayslip record={selectedRecord} employeeName={user.username} />
                   </div>
                </div>
             </motion.div>
          </div>
        )}
      </AnimatePresence>

      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          body * { visibility: hidden; }
          #printable-payslip, #printable-payslip * { visibility: visible; }
          #printable-payslip { 
            position: absolute; 
            left: 0; 
            top: 0; 
            width: 100%; 
            padding: 0 !important;
            margin: 0 !important;
            border: none !important;
          }
        }
      `}} />
    </div>
  );
};

export default PayrollTasks;
