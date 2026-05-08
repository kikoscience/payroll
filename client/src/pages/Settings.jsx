import { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useTheme } from '../context/ThemeContext';
import { Shield, Key, Moon, Sun, Smartphone, User, Save, Lock } from 'lucide-react';
import { motion } from 'framer-motion';

const Settings = () => {
  const { user } = useAuth();
  const { darkMode, toggleDarkMode } = useTheme();
  const toast = useToast();
  const [passwords, setPasswords] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' });
  const [loading, setLoading] = useState(false);

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (passwords.newPassword !== passwords.confirmPassword) {
      return toast.error('New passwords do not match');
    }
    if (passwords.newPassword.length < 6) {
      return toast.error('Password must be at least 6 characters');
    }

    setLoading(true);
    try {
      await axios.put('/api/users/me/password', {
        oldPassword: passwords.oldPassword,
        newPassword: passwords.newPassword
      });
      toast.success('Password updated successfully');
      setPasswords({ oldPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error updating password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl space-y-8 pb-20 lg:pb-0">
      <div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Account Settings</h1>
        <p className="text-slate-500 font-medium">Manage your security and preferences</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Profile Card */}
        <div className="md:col-span-1 space-y-6">
          <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm text-center">
            <div className="w-24 h-24 bg-primary-50 rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-white shadow-lg shadow-primary-100">
               <User className="w-10 h-10 text-primary-600" />
            </div>
            <h2 className="text-xl font-black text-slate-900 truncate">{user?.fullName || user?.username}</h2>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">{user?.role}</p>
            <div className="inline-flex items-center gap-2 px-4 py-1 bg-emerald-50 text-emerald-600 rounded-full text-[10px] font-black uppercase tracking-widest">
               <Shield className="w-3 h-3" /> Secure Account
            </div>
          </div>

          <div className="bg-slate-900 p-8 rounded-[40px] text-white space-y-4">
             <div className="flex items-center gap-3">
                <Smartphone className="w-6 h-6 text-primary-400" />
                <h3 className="font-black tracking-tight">Mobile First</h3>
             </div>
             <p className="text-xs text-slate-400 leading-relaxed font-medium">Our system is optimized for your iPhone. Access your payslips anytime, anywhere.</p>
          </div>
        </div>

        {/* Settings Forms */}
        <div className="md:col-span-2 space-y-8">
          {/* Security Form */}
          <div className="bg-white p-8 md:p-10 rounded-[40px] border border-slate-100 shadow-sm space-y-8">
            <div className="flex items-center gap-3">
               <div className="p-3 bg-red-50 text-red-600 rounded-2xl">
                  <Lock className="w-6 h-6" />
               </div>
               <div>
                  <h3 className="text-xl font-black text-slate-900 tracking-tight">Update Security</h3>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Change your account password</p>
               </div>
            </div>

            <form onSubmit={handlePasswordChange} className="space-y-6">
               <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Current Password</label>
                  <input 
                    type="password" 
                    required
                    className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold focus:outline-none focus:ring-4 focus:ring-primary-500/10 transition-all"
                    value={passwords.oldPassword}
                    onChange={(e) => setPasswords({...passwords, oldPassword: e.target.value})}
                  />
               </div>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">New Password</label>
                    <input 
                      type="password" 
                      required
                      className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold focus:outline-none focus:ring-4 focus:ring-primary-500/10 transition-all"
                      value={passwords.newPassword}
                      onChange={(e) => setPasswords({...passwords, newPassword: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Confirm New Password</label>
                    <input 
                      type="password" 
                      required
                      className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold focus:outline-none focus:ring-4 focus:ring-primary-500/10 transition-all"
                      value={passwords.confirmPassword}
                      onChange={(e) => setPasswords({...passwords, confirmPassword: e.target.value})}
                    />
                  </div>
               </div>
               <button 
                 disabled={loading}
                 className="w-full py-5 bg-slate-900 text-white rounded-[24px] font-black text-sm flex items-center justify-center gap-3 shadow-xl shadow-slate-200 hover:bg-primary-600 transition-all"
               >
                 <Save className="w-5 h-5" /> {loading ? 'UPDATING...' : 'SAVE NEW PASSWORD'}
               </button>
            </form>
          </div>

          <div className="bg-white dark:bg-slate-900 p-8 md:p-10 rounded-[40px] border border-slate-100 dark:border-slate-800 shadow-sm space-y-8">
            <div className="flex items-center gap-3">
               <div className="p-3 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-2xl">
                  <Sun className="w-6 h-6" />
               </div>
               <div>
                  <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">Preferences</h3>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Interface & Theme</p>
               </div>
            </div>
            
            <div className="flex items-center justify-between p-6 bg-slate-50 dark:bg-slate-800/50 rounded-3xl border border-slate-100 dark:border-slate-800">
               <div>
                  <p className="font-black text-slate-900 dark:text-white">Dark Mode</p>
                  <p className="text-xs font-medium text-slate-400">Reduce eye strain at night</p>
               </div>
               <button 
                 onClick={toggleDarkMode}
                 className={`relative w-14 h-8 rounded-full transition-colors duration-300 flex items-center px-1 ${
                   darkMode ? 'bg-primary-600' : 'bg-slate-300'
                 }`}
               >
                  <motion.div 
                    animate={{ x: darkMode ? 24 : 0 }}
                    className="w-6 h-6 bg-white rounded-full shadow-sm flex items-center justify-center"
                  >
                     {darkMode ? <Moon className="w-3 h-3 text-primary-600" /> : <Sun className="w-3 h-3 text-amber-500" />}
                  </motion.div>
               </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
