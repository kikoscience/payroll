import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { FileText, Printer, Search, Calendar, Wallet, DollarSign, X, CheckCircle, ArrowRight, Layers, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import PrintablePayslip from '../components/PrintablePayslip';

const PayrollTasks = () => {
  const { user } = useAuth();
  const toast = useToast();
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [activeTab, setActiveTab] = useState('Payroll'); 

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
    { id: 'Payroll', name: 'Salaries', icon: Wallet },
    { id: 'Other Receivables', name: 'Receivables', icon: DollarSign }
  ];

  return (
    <div className="space-y-6 pb-20 lg:pb-0">
      <div className="print:hidden">
        <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">My Records</h1>
        <p className="text-slate-500 font-medium text-sm">View and print your official payslips</p>
      </div>

      {/* Mobile-Friendly Tabs */}
      <div className="flex gap-2 p-1 bg-slate-200/50 rounded-2xl print:hidden">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl transition-all ${
              activeTab === tab.id 
              ? 'bg-white text-primary-600 shadow-sm' 
              : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            <span className="font-black uppercase tracking-widest text-[9px]">{tab.name}</span>
          </button>
        ))}
      </div>

      <div className="relative group print:hidden">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
        <input 
          type="text" 
          placeholder="Search records..." 
          className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-[24px] font-bold focus:outline-none focus:ring-4 focus:ring-primary-500/10 shadow-sm"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Desktop Table (Hidden on Mobile) */}
      <div className="hidden lg:block bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden print:hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 text-slate-400 text-[10px] font-black uppercase tracking-widest border-b border-slate-100">
                <th className="px-8 py-6">Disbursement Item</th>
                {activeTab === 'Payroll' && <th className="px-8 py-6">Period</th>}
                <th className="px-8 py-6 text-right">Net Amount</th>
                <th className="px-8 py-6 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr><td colSpan="4" className="px-8 py-12 text-center text-slate-400 font-bold">Fetching records...</td></tr>
              ) : filteredRecords.length === 0 ? (
                <tr><td colSpan="4" className="px-8 py-20 text-center"><p className="text-slate-400 italic">No records found.</p></td></tr>
              ) : (
                filteredRecords.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50/50 transition-all">
                    <td className="px-8 py-5">
                       <div className="flex items-center gap-4">
                          <div className={`p-3 rounded-2xl ${activeTab === 'Payroll' ? 'bg-emerald-50 text-emerald-600' : 'bg-indigo-50 text-indigo-600'}`}>
                             {activeTab === 'Payroll' ? <Wallet className="w-5 h-5" /> : <DollarSign className="w-5 h-5" />}
                          </div>
                          <div>
                             <p className="font-black text-slate-900 leading-tight">{r.batchName || r.description}</p>
                             <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Posted {new Date(r.postedDate).toLocaleDateString()}</p>
                          </div>
                       </div>
                    </td>
                    {activeTab === 'Payroll' && <td className="px-8 py-5 font-bold text-slate-600">{r.period}</td>}
                    <td className="px-8 py-5 text-right font-black text-slate-900 text-lg">
                       ₱{parseFloat(r.netAmountDue).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-8 py-5 text-center">
                       <button 
                         onClick={() => setSelectedRecord(r)}
                         className={`p-3 text-white rounded-2xl transition-all shadow-lg ${activeTab === 'Payroll' ? 'bg-slate-900 hover:bg-emerald-600' : 'bg-indigo-600 hover:bg-indigo-700'}`}
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

      {/* Mobile Card List (Hidden on Desktop) */}
      <div className="lg:hidden space-y-4 print:hidden">
        {loading ? (
           <p className="text-center text-slate-400 font-bold py-10">Loading your history...</p>
        ) : filteredRecords.length === 0 ? (
           <p className="text-center text-slate-400 italic py-10">No records found.</p>
        ) : (
          filteredRecords.map((r) => (
            <div 
              key={r.id} 
              onClick={() => setSelectedRecord(r)}
              className="bg-white p-5 rounded-[32px] border border-slate-100 shadow-sm active:scale-95 transition-all flex items-center justify-between group"
            >
               <div className="flex items-center gap-4">
                  <div className={`p-4 rounded-2xl ${activeTab === 'Payroll' ? 'bg-emerald-50 text-emerald-600' : 'bg-indigo-50 text-indigo-600'}`}>
                     {activeTab === 'Payroll' ? <Wallet className="w-6 h-6" /> : <DollarSign className="w-6 h-6" />}
                  </div>
                  <div>
                     <p className="font-black text-slate-900 leading-tight truncate max-w-[150px]">{r.batchName || r.description}</p>
                     <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{activeTab === 'Payroll' ? r.period : new Date(r.postedDate).toLocaleDateString()}</p>
                     <p className="text-lg font-black text-slate-900 mt-1">₱{parseFloat(r.netAmountDue).toLocaleString()}</p>
                  </div>
               </div>
               <div className="w-10 h-10 bg-slate-50 rounded-full flex items-center justify-center text-slate-300 group-active:text-primary-600 transition-colors">
                  <ChevronRight className="w-6 h-6" />
               </div>
            </div>
          ))
        )}
      </div>

      {/* Print Preview Modal */}
      <AnimatePresence>
        {selectedRecord && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-0 md:p-4 bg-slate-900/60 backdrop-blur-sm print:bg-white print:block">
             <motion.div 
               initial={{ opacity: 0, y: 100 }}
               animate={{ opacity: 1, y: 0 }}
               exit={{ opacity: 0, y: 100 }}
               className="bg-white w-full h-full md:h-auto md:rounded-[40px] md:max-w-5xl md:max-h-[90vh] overflow-hidden flex flex-col shadow-2xl print:shadow-none print:max-h-none print:rounded-none"
             >
                <div className="p-6 md:p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 print:hidden">
                   <div>
                      <h2 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">Payslip Preview</h2>
                      <p className="text-[10px] md:text-sm font-bold text-slate-500 uppercase tracking-widest">Official Record Audit</p>
                   </div>
                   <div className="flex gap-2">
                      <button 
                        onClick={() => window.print()}
                        className={`px-4 md:px-8 py-3 text-white rounded-2xl font-black text-xs md:text-sm flex items-center gap-2 shadow-lg ${
                           activeTab === 'Payroll' ? 'bg-primary-600' : 'bg-indigo-600'
                        }`}
                      >
                        <Printer className="w-5 h-5" /> <span className="hidden md:inline">Print / Save</span>
                      </button>
                      <button onClick={() => setSelectedRecord(null)} className="p-2 text-slate-400 hover:text-slate-900 transition-colors">
                        <X className="w-8 h-8" />
                      </button>
                   </div>
                </div>
                <div className="flex-1 overflow-y-auto p-4 md:p-12 bg-slate-100 print:bg-white print:p-0">
                   <div className="print:m-0 bg-white md:bg-transparent rounded-[32px] overflow-hidden md:overflow-visible">
                      <PrintablePayslip record={selectedRecord} employeeName={user.fullName || user.username} />
                   </div>
                   <div className="h-20 lg:hidden" /> {/* Mobile bottom nav buffer */}
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
