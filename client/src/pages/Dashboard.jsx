import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { 
  Users, Layers, FileText, TrendingUp, Calendar, 
  ChevronRight, ArrowUpRight, DollarSign, Wallet, 
  CheckCircle, Clock, AlertCircle, Eye
} from 'lucide-react';
import { motion } from 'framer-motion';

const Dashboard = () => {
  const { user } = useAuth();
  const isEmployee = user?.role === 'viewer';

  return isEmployee ? <EmployeeDashboard /> : <AdminDashboard />;
};

const AdminDashboard = () => {
  const [stats, setStats] = useState({ employees: 0, batches: 0, totalAmount: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const cards = [
    { label: 'Total Registry', value: stats.employees, icon: Users, color: 'bg-indigo-50 text-indigo-600', trend: '+12% this month' },
    { label: 'Payroll Batches', value: stats.batches, icon: Layers, color: 'bg-emerald-50 text-emerald-600', trend: 'All systems active' },
    { label: 'Total Disbursement', value: `₱${stats.totalAmount.toLocaleString()}`, icon: TrendingUp, color: 'bg-amber-50 text-amber-600', trend: 'Across all categories' },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Executive Overview</h1>
        <p className="text-slate-500 font-medium">System-wide payroll performance and metrics</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {cards.map((card, i) => (
          <motion.div 
            key={card.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="p-8 bg-white rounded-[32px] border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 transition-all group"
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
        <div className="bg-white rounded-[40px] border border-slate-100 p-8 shadow-sm">
          <h2 className="text-xl font-black text-slate-900 mb-6">Recent System Activity</h2>
          <div className="space-y-6">
            {[1, 2, 3].map((_, i) => (
              <div key={i} className="flex gap-4 items-center">
                <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center">
                  <Clock className="w-5 h-5 text-slate-400" />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900">Monthly Payroll Uploaded</p>
                  <p className="text-xs font-medium text-slate-400">Processed by Admin • 2 hours ago</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="bg-primary-600 rounded-[40px] p-8 text-white relative overflow-hidden group">
          <div className="relative z-10">
            <h2 className="text-2xl font-black mb-2">Ready for Disbursement?</h2>
            <p className="text-primary-100 font-medium mb-8 max-w-[280px]">Generate bank-ready files for Landbank or Government exports in one click.</p>
            <button className="px-8 py-4 bg-white text-primary-600 rounded-2xl font-black text-sm flex items-center gap-2 hover:bg-primary-50 transition-all shadow-xl shadow-primary-900/20">
              Go to Batches <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          <Layers className="absolute -right-8 -bottom-8 w-48 h-48 text-primary-500/30 rotate-12 group-hover:rotate-0 transition-transform duration-700" />
        </div>
      </div>
    </div>
  );
};

const EmployeeDashboard = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMyRecords = async () => {
      try {
        const res = await axios.get('/api/payslips/my-records');
        setRecords(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchMyRecords();
  }, []);

  const totalReceived = records.reduce((sum, r) => sum + (parseFloat(r.netAmountDue) || 0), 0);
  const salaryRecords = records.filter(r => r.batchType === 'Payroll');
  const otherRecords = records.filter(r => r.batchType === 'Other Receivables');

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Personal Dashboard</h1>
          <p className="text-slate-500 font-medium">Your financial history and disbursements</p>
        </div>
        <div className="hidden md:block text-right">
           <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Net Received</p>
           <p className="text-3xl font-black text-primary-600 tracking-tight">₱{totalReceived.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Monthly Salary Section */}
        <div className="space-y-6">
          <div className="flex items-center gap-3">
             <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
                <Wallet className="w-5 h-5" />
             </div>
             <h2 className="text-xl font-black text-slate-900">Monthly Salaries</h2>
          </div>
          
          <div className="space-y-4">
            {loading ? <p className="text-slate-400">Loading...</p> : salaryRecords.length === 0 ? <p className="text-slate-400 text-sm italic">No salary records found yet.</p> : 
              salaryRecords.slice(0, 5).map((r, i) => (
                <motion.div 
                  key={r.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="bg-white p-6 rounded-[24px] border border-slate-100 shadow-sm flex justify-between items-center group hover:border-emerald-200 transition-all"
                >
                  <div>
                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">{r.period}</p>
                    <p className="font-bold text-slate-800">{r.batchName}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-black text-emerald-600">₱{parseFloat(r.netAmountDue).toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                    <span className="text-[9px] font-black bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-full uppercase">Posted</span>
                  </div>
                </motion.div>
              ))
            }
          </div>
        </div>

        {/* Other Receivables Section */}
        <div className="space-y-6">
          <div className="flex items-center gap-3">
             <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                <DollarSign className="w-5 h-5" />
             </div>
             <h2 className="text-xl font-black text-slate-900">Other Receivables</h2>
          </div>

          <div className="space-y-4">
            {loading ? <p className="text-slate-400">Loading...</p> : otherRecords.length === 0 ? <p className="text-slate-400 text-sm italic">No other receivables found.</p> : 
              otherRecords.slice(0, 5).map((r, i) => (
                <motion.div 
                  key={r.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="bg-white p-6 rounded-[24px] border border-slate-100 shadow-sm flex justify-between items-center group hover:border-indigo-200 transition-all"
                >
                  <div>
                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">{r.subType || 'AD-HOC'}</p>
                    <p className="font-bold text-slate-800">{r.description || 'Disbursement'}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-black text-indigo-600">₱{parseFloat(r.netAmountDue).toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                    <p className="text-[10px] text-slate-400 font-bold uppercase">{new Date(r.postedDate).toLocaleDateString()}</p>
                  </div>
                </motion.div>
              ))
            }
          </div>
        </div>
      </div>

      <div className="bg-slate-900 rounded-[40px] p-8 text-center text-white relative overflow-hidden">
         <div className="relative z-10">
            <CheckCircle className="w-12 h-12 text-primary-400 mx-auto mb-4" />
            <h2 className="text-2xl font-black mb-2">Need a Printed Copy?</h2>
            <p className="text-slate-400 font-medium mb-6">Individual printable payslips are coming soon to your dashboard.</p>
         </div>
         <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-primary-400 via-transparent to-transparent"></div>
      </div>
    </div>
  );
};

export default Dashboard;
