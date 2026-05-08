import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { FileText, Printer, Search, Calendar, Wallet, DollarSign, X, CheckCircle, ArrowRight, Layers } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import PrintablePayslip from '../components/PrintablePayslip';

const PayrollTasks = () => {
  const { user } = useAuth();
  const toast = useToast();
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [activeTab, setActiveTab] = useState('Payroll'); // 'Payroll' or 'Other Receivables'

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

  const filteredRecords = records.filter(r => 
    r.batchType === activeTab &&
    (
      String(r.batchName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      String(r.period || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      String(r.subType || '').toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const tabs = [
    { id: 'Payroll', name: 'Monthly Salaries', icon: Wallet },
    { id: 'Other Receivables', name: 'Other Receivables', icon: DollarSign }
  ];

  return (
    <div className="space-y-8 print:p-0">
      <div className="print:hidden">
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Financial Records</h1>
        <p className="text-slate-500 font-medium">Access and print your official disbursement history</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 border-b border-slate-200 print:hidden">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-6 py-4 border-b-4 transition-all ${
              activeTab === tab.id 
              ? 'border-primary-600 text-primary-600' 
              : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
          >
            <tab.icon className="w-5 h-5" />
            <span className="font-black uppercase tracking-widest text-[10px]">{tab.name}</span>
          </button>
        ))}
      </div>

      {/* Search & Stats */}
      <div className="flex flex-col md:flex-row gap-6 print:hidden">
        <div className="relative flex-1 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-primary-500 transition-colors" />
          <input 
            type="text" 
            placeholder={`Search ${activeTab === 'Payroll' ? 'salaries' : 'receivables'}...`} 
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
                {activeTab === 'Payroll' && <th className="px-8 py-6">Period</th>}
                <th className="px-8 py-6">Type</th>
                <th className="px-8 py-6 text-right">Net Amount</th>
                <th className="px-8 py-6 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr><td colSpan="5" className="px-8 py-12 text-center text-slate-400 font-bold">Fetching your history...</td></tr>
              ) : filteredRecords.length === 0 ? (
                <tr><td colSpan="5" className="px-8 py-20 text-center">
                  <div className="flex flex-col items-center gap-2">
                    <Layers className="w-12 h-12 text-slate-100" />
                    <p className="text-slate-400 font-medium italic">No {activeTab.toLowerCase()} records found yet.</p>
                  </div>
                </td></tr>
              ) : (
                filteredRecords.map((r, i) => (
                  <tr key={r.id} className="hover:bg-slate-50/50 group transition-all">
                    <td className="px-8 py-5">
                       <div className="flex items-center gap-4">
                          <div className={`p-3 rounded-2xl ${activeTab === 'Payroll' ? 'bg-emerald-50 text-emerald-600' : 'bg-indigo-50 text-indigo-600'}`}>
                             {activeTab === 'Payroll' ? <Wallet className="w-5 h-5" /> : <DollarSign className="w-5 h-5" />}
                          </div>
                          <div>
                             <p className="font-black text-slate-900 leading-tight">{r.batchName || r.description}</p>
                             <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Posted on {new Date(r.postedDate).toLocaleDateString()}</p>
                          </div>
                       </div>
                    </td>
                    {activeTab === 'Payroll' && <td className="px-8 py-5 font-bold text-slate-600">{r.period}</td>}
                    <td className="px-8 py-5">
                       <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${activeTab === 'Payroll' ? 'bg-emerald-100 text-emerald-700' : 'bg-indigo-100 text-indigo-700'}`}>
                          {activeTab === 'Payroll' ? 'Monthly' : r.subType || 'Other'}
                       </span>
                    </td>
                    <td className="px-8 py-5 text-right font-black text-slate-900 text-lg">
                       ₱{parseFloat(r.netAmountDue).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-8 py-5 text-center">
                       <button 
                         onClick={() => setSelectedRecord(r)}
                         className={`p-3 text-white rounded-2xl transition-all shadow-lg shadow-slate-200 flex items-center justify-center mx-auto ${
                            activeTab === 'Payroll' ? 'bg-slate-900 hover:bg-emerald-600' : 'bg-indigo-600 hover:bg-indigo-700'
                         }`}
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
                      <p className="text-sm font-medium text-slate-500">Official {activeTab} Advice</p>
                   </div>
                   <div className="flex gap-3">
                      <button 
                        onClick={() => window.print()}
                        className={`px-8 py-3 text-white rounded-2xl font-black text-sm flex items-center gap-2 shadow-lg ${
                           activeTab === 'Payroll' ? 'bg-primary-600 shadow-primary-200' : 'bg-indigo-600 shadow-indigo-200'
                        }`}
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
