import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { 
  Users, Layers, FileText, TrendingUp, Calendar, 
  ChevronRight, ArrowUpRight, DollarSign, Wallet, 
  CheckCircle, Clock, AlertCircle, Eye, Megaphone, Bell, Info, Award, Smartphone
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Dashboard = () => {
  const { user } = useAuth();
  const isEmployee = user?.role === 'viewer';

  return isEmployee ? <EmployeeDashboard /> : <AdminDashboard />;
};

const AdminDashboard = () => {
  const [stats, setStats] = useState({ employees: 0, batches: 0, totalAmount: 0 });
  const [loading, setLoading] = useState(true);
  const [broadcasts, setBroadcasts] = useState([]);
  const [showBroadcastModal, setShowBroadcastModal] = useState(false);
  const [newBroadcast, setNewBroadcast] = useState({ title: '', message: '', type: 'info' });

  useEffect(() => {
    fetchStats();
    fetchBroadcasts();
  }, []);

  const fetchStats = async () => {
    try {
      const [empRes, batchRes] = await Promise.all([
        axios.get('/api/employees?limit=1'),
        axios.get('/api/payslips/batches')
      ]);
      const total = batchRes.data.reduce((sum, b) => sum + (parseFloat(b.totalAmount) || 0), 0);
      setStats({
        employees: empRes.data.pagination.total,
        batches: batchRes.data.length,
        totalAmount: total
      });
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const fetchBroadcasts = async () => {
    try {
      const res = await axios.get('/api/broadcasts');
      setBroadcasts(res.data);
    } catch (err) { console.error(err); }
  };

  const handlePostBroadcast = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/broadcasts', newBroadcast);
      setNewBroadcast({ title: '', message: '', type: 'info' });
      setShowBroadcastModal(false);
      fetchBroadcasts();
    } catch (err) { alert('Error posting'); }
  };

  const deleteBroadcast = async (id) => {
    try {
      await axios.delete(`/api/broadcasts/${id}`);
      fetchBroadcasts();
    } catch (err) { alert('Error deleting'); }
  };

  const cards = [
    { label: 'Total Registry', value: stats.employees, icon: Users, color: 'bg-indigo-50 text-indigo-600', trend: '+12% this month' },
    { label: 'Payroll Batches', value: stats.batches, icon: Layers, color: 'bg-emerald-50 text-emerald-600', trend: 'All systems active' },
    { label: 'Total Disbursement', value: `₱${stats.totalAmount.toLocaleString()}`, icon: TrendingUp, color: 'bg-amber-50 text-amber-600', trend: 'Across all categories' },
  ];

  return (
    <div className="space-y-8 pb-20 lg:pb-0">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Executive Overview</h1>
          <p className="text-slate-500 font-medium">System-wide payroll performance and metrics</p>
        </div>
        <button 
          onClick={() => setShowBroadcastModal(true)}
          className="px-6 py-3 bg-slate-900 text-white rounded-2xl font-black text-sm flex items-center gap-2 shadow-xl shadow-slate-200"
        >
          <Megaphone className="w-4 h-4 text-primary-400" /> Post Notice
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {cards.map((card, i) => (
          <motion.div 
            key={card.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="p-8 bg-white rounded-[32px] border border-slate-100 shadow-sm group"
          >
            <div className="flex justify-between items-start mb-6">
              <div className={`p-4 rounded-2xl ${card.color} transition-transform group-hover:scale-110`}>
                <card.icon className="w-6 h-6" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-300">{card.trend}</span>
            </div>
            <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-1">{card.label}</p>
            <p className="text-3xl font-black text-slate-900">{loading ? '...' : card.value}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Broadcast List */}
        <div className="bg-white rounded-[40px] border border-slate-100 p-8 shadow-sm">
          <h2 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-2">
            <Megaphone className="w-5 h-5 text-primary-600" /> Active Notices
          </h2>
          <div className="space-y-4">
            {broadcasts.length === 0 ? <p className="text-slate-400 text-sm italic">No active notices.</p> : 
              broadcasts.map((b) => (
                <div key={b.id} className="p-6 bg-slate-50 rounded-3xl border border-slate-100 flex justify-between items-start">
                   <div>
                      <p className="font-black text-slate-900">{b.title}</p>
                      <p className="text-xs text-slate-500 mt-1">{b.message}</p>
                   </div>
                   <button onClick={() => deleteBroadcast(b.id)} className="text-slate-300 hover:text-red-500 p-1">
                      <Clock className="w-4 h-4" />
                   </button>
                </div>
              ))
            }
          </div>
        </div>
        
        <div className="bg-primary-600 rounded-[40px] p-8 text-white relative overflow-hidden group">
          <div className="relative z-10">
            <h2 className="text-2xl font-black mb-2">Audit Trails Active</h2>
            <p className="text-primary-100 font-medium mb-8 max-w-[280px]">Every upload, deletion, and account change is now being logged for system security.</p>
            <button className="px-8 py-4 bg-white text-primary-600 rounded-2xl font-black text-sm flex items-center gap-2 hover:bg-primary-50 transition-all shadow-xl shadow-primary-900/20">
              View Audit Logs <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          <Layers className="absolute -right-8 -bottom-8 w-48 h-48 text-primary-500/30 rotate-12 group-hover:rotate-0 transition-transform duration-700" />
        </div>
      </div>

      {/* Broadcast Modal */}
      <AnimatePresence>
        {showBroadcastModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
             <motion.form 
               initial={{ opacity: 0, scale: 0.9 }}
               animate={{ opacity: 1, scale: 1 }}
               onSubmit={handlePostBroadcast}
               className="bg-white w-full max-w-lg rounded-[40px] p-8 shadow-2xl space-y-6"
             >
                <div className="flex justify-between items-center">
                   <h2 className="text-2xl font-black text-slate-900 tracking-tight">Post Notice</h2>
                   <button type="button" onClick={() => setShowBroadcastModal(false)} className="text-slate-400">Close</button>
                </div>
                <div className="space-y-4">
                   <input 
                     className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold"
                     placeholder="Announcement Title"
                     value={newBroadcast.title}
                     onChange={(e) => setNewBroadcast({...newBroadcast, title: e.target.value})}
                     required
                   />
                   <textarea 
                     className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-medium min-h-[120px]"
                     placeholder="Enter message for all employees..."
                     value={newBroadcast.message}
                     onChange={(e) => setNewBroadcast({...newBroadcast, message: e.target.value})}
                     required
                   />
                </div>
                <button className="w-full py-5 bg-primary-600 text-white rounded-[24px] font-black text-sm shadow-xl shadow-primary-200">
                   POST TO ALL DASHBOARDS
                </button>
             </motion.form>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

const EmployeeDashboard = () => {
  const [records, setRecords] = useState([]);
  const [broadcasts, setBroadcasts] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [recRes, broadRes, sumRes] = await Promise.all([
          axios.get('/api/payslips/my-records'),
          axios.get('/api/broadcasts'),
          axios.get(`/api/payslips/my-summary/${new Date().getFullYear()}`)
        ]);
        setRecords(recRes.data);
        setBroadcasts(broadRes.data);
        setSummary(sumRes.data);
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    fetchData();
  }, []);

  const totalReceived = records.reduce((sum, r) => sum + (parseFloat(r.netAmountDue) || 0), 0);
  const salaryRecords = records.filter(r => r.batchType === 'Payroll');
  const otherRecords = records.filter(r => r.batchType === 'Other Receivables');

  return (
    <div className="space-y-8 pb-20 lg:pb-0">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Personal Dashboard</h1>
          <p className="text-slate-500 font-medium">Financial transparency for CDH Staff</p>
        </div>
        <div className="hidden md:block text-right">
           <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Net Received</p>
           <p className="text-3xl font-black text-primary-600 tracking-tight">₱{totalReceived.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
        </div>
      </div>

      {/* Announcements Board */}
      <AnimatePresence>
        {broadcasts.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             {broadcasts.map(b => (
               <motion.div 
                 key={b.id}
                 initial={{ opacity: 0, x: -20 }}
                 animate={{ opacity: 1, x: 0 }}
                 className={`p-6 rounded-[32px] border-l-8 flex gap-4 items-start ${
                    b.type === 'success' ? 'bg-emerald-50 border-emerald-500 text-emerald-900' : 'bg-primary-50 border-primary-500 text-primary-900'
                 }`}
               >
                  <Bell className="w-6 h-6 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-black text-lg leading-tight">{b.title}</h3>
                    <p className="text-sm font-medium mt-1 opacity-80">{b.message}</p>
                  </div>
               </motion.div>
             ))}
          </div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         {/* Yearly Summary Card */}
         <div className="md:col-span-1 bg-slate-900 rounded-[40px] p-8 text-white flex flex-col justify-between shadow-2xl shadow-slate-300">
            <div>
               <div className="flex justify-between items-center mb-8">
                  <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-md">
                     <Award className="w-6 h-6 text-primary-400" />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-50">{new Date().getFullYear()} Summary</span>
               </div>
               <p className="text-xs font-black uppercase tracking-widest opacity-40 mb-1">Cumulative Gross Income</p>
               <p className="text-4xl font-black tracking-tighter mb-8">₱{summary?.totalGross?.toLocaleString() || '0'}</p>
            </div>
            <div className="space-y-4 pt-4 border-t border-white/10">
               <div className="flex justify-between text-xs font-bold">
                  <span className="opacity-50 uppercase">Total Deductions</span>
                  <span className="text-red-400">- ₱{summary?.totalDeductions?.toLocaleString() || '0'}</span>
               </div>
               <div className="flex justify-between text-lg font-black">
                  <span className="uppercase text-[10px] self-center">Net Final</span>
                  <span className="text-primary-400">₱{summary?.totalNet?.toLocaleString() || '0'}</span>
               </div>
            </div>
         </div>

         {/* Mini Charts / Status cards */}
         <div className="md:col-span-2 bg-white rounded-[40px] border border-slate-100 p-8 shadow-sm flex flex-col justify-center gap-6">
            <div className="flex items-center gap-6">
               <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center">
                  <CheckCircle className="w-8 h-8 text-emerald-600" />
               </div>
               <div>
                  <h3 className="text-xl font-black text-slate-900">All Records Verified</h3>
                  <p className="text-sm font-medium text-slate-500">Your {records.length} disbursements have been audited and posted.</p>
               </div>
            </div>
            <div className="h-px bg-slate-100 w-full" />
            <div className="flex items-center gap-6">
               <div className="w-16 h-16 rounded-full bg-primary-50 flex items-center justify-center">
                  <Smartphone className="w-8 h-8 text-primary-600" />
               </div>
               <div>
                  <h3 className="text-xl font-black text-slate-900">Mobile Access Active</h3>
                  <p className="text-sm font-medium text-slate-500">Check your payslips on your iPhone 15 anytime via your employee ID.</p>
               </div>
            </div>
         </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Monthly Salary Section */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
             <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
                   <Wallet className="w-5 h-5" />
                </div>
                <h2 className="text-xl font-black text-slate-900">Monthly Salaries</h2>
             </div>
             <ChevronRight className="w-5 h-5 text-slate-300" />
          </div>
          <div className="space-y-4">
            {loading ? <p className="text-slate-400">Loading...</p> : salaryRecords.length === 0 ? <p className="text-slate-400 text-sm italic">No salary records found yet.</p> : 
              salaryRecords.slice(0, 3).map((r, i) => (
                <div key={r.id} className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm flex justify-between items-center">
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{r.period}</p>
                    <p className="font-black text-slate-900">{r.batchName}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-black text-emerald-600">₱{parseFloat(r.netAmountDue).toLocaleString()}</p>
                    <span className="text-[9px] font-black bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-full uppercase">Verified</span>
                  </div>
                </div>
              ))
            }
          </div>
        </div>

        {/* Other Receivables Section */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
             <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                   <DollarSign className="w-5 h-5" />
                </div>
                <h2 className="text-xl font-black text-slate-900">Other Receivables</h2>
             </div>
             <ChevronRight className="w-5 h-5 text-slate-300" />
          </div>
          <div className="space-y-4">
            {loading ? <p className="text-slate-400">Loading...</p> : otherRecords.length === 0 ? <p className="text-slate-400 text-sm italic">No other receivables found.</p> : 
              otherRecords.slice(0, 3).map((r, i) => (
                <div key={r.id} className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm flex justify-between items-center">
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{r.subType || 'AD-HOC'}</p>
                    <p className="font-black text-slate-900">{r.description || 'Disbursement'}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-black text-indigo-600">₱{parseFloat(r.netAmountDue).toLocaleString()}</p>
                    <p className="text-[10px] text-slate-400 font-bold uppercase">{new Date(r.postedDate).toLocaleDateString()}</p>
                  </div>
                </div>
              ))
            }
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
