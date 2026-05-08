import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { User, Shield, Key, Trash2, Edit3, Plus, Search, X, ShieldAlert, ShieldCheck, UserCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Accounts = () => {
  const { user } = useAuth();
  const toast = useToast();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  useEffect(() => { fetchUsers(); }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/users');
      setUsers(res.data);
    } catch (err) { toast.error('Access Denied'); }
    finally { setLoading(false); }
  };

  const handleDelete = async (id, username) => {
    if (username === user.username) return toast.error('You cannot delete your own account!');
    if (!window.confirm(`Delete account "${username}"?`)) return;
    try {
      await axios.delete(`/api/users/${id}`);
      toast.success('Account deleted');
      fetchUsers();
    } catch (err) { toast.error('Delete failed'); }
  };

  const filteredUsers = users.filter(u => 
    u.username.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">System Accounts</h1>
          <p className="text-slate-500 font-medium">Manage user access and security permissions</p>
        </div>
        <button 
          onClick={() => { setEditingUser(null); setIsModalOpen(true); }}
          className="btn-primary flex items-center gap-2 shadow-lg shadow-primary-200"
        >
          <Plus className="w-5 h-5" /> New Account
        </button>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
        <input 
          type="text" 
          placeholder="Search by username or role..." 
          className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-primary-500/10 transition-all shadow-sm font-bold"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 text-slate-400 text-[10px] font-black uppercase tracking-widest border-b border-slate-100">
                <th className="px-8 py-5">System Identity</th>
                <th className="px-8 py-5">Access Level</th>
                <th className="px-8 py-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 text-sm">
              {loading ? (
                <tr><td colSpan="3" className="px-8 py-12 text-center text-slate-400 font-bold">Initializing user list...</td></tr>
              ) : filteredUsers.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50/50 transition-all group">
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-2xl ${u.role === 'admin' ? 'bg-indigo-50 text-indigo-600' : u.role === 'uploader' ? 'bg-blue-50 text-blue-600' : 'bg-slate-50 text-slate-400'}`}>
                        <User className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="font-black text-slate-900 text-base">{u.username}</p>
                        <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Internal User ID: #{u.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <span className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                      u.role === 'admin' ? 'bg-indigo-100 text-indigo-700' : 
                      u.role === 'uploader' ? 'bg-blue-100 text-blue-700' : 
                      'bg-slate-100 text-slate-600'
                    }`}>
                      {u.role === 'admin' ? <ShieldCheck className="w-3 h-3" /> : u.role === 'uploader' ? <ShieldAlert className="w-3 h-3" /> : <UserCheck className="w-3 h-3" />}
                      {u.role}
                    </span>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        onClick={() => { setEditingUser(u); setIsModalOpen(true); }}
                        className="p-3 text-slate-300 hover:text-primary-600 hover:bg-primary-50 rounded-2xl transition-all"
                      >
                        <Edit3 className="w-5 h-5" />
                      </button>
                      <button 
                        onClick={() => handleDelete(u.id, u.username)}
                        className="p-3 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <UserModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSuccess={fetchUsers} 
        userToEdit={editingUser}
      />
    </div>
  );
};

const UserModal = ({ isOpen, onClose, onSuccess, userToEdit }) => {
  const toast = useToast();
  const [formData, setFormData] = useState({ username: '', password: '', role: 'viewer' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (userToEdit) {
      setFormData({ username: userToEdit.username, password: '', role: userToEdit.role });
    } else {
      setFormData({ username: '', password: '', role: 'viewer' });
    }
  }, [userToEdit, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (userToEdit) {
        await axios.put(`/api/users/${userToEdit.id}`, formData);
        toast.success('Account updated');
      } else {
        if (!formData.password) return toast.error('Password is required for new accounts');
        await axios.post('/api/users', formData);
        toast.success('Account created');
      }
      onSuccess();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error processing request');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-[40px] w-full max-w-md shadow-2xl overflow-hidden">
        <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">{userToEdit ? 'Update Identity' : 'Secure Provisioning'}</h2>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-900 transition-colors"><X className="w-8 h-8" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Username / ID</label>
            <div className="relative">
               <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
               <input 
                required 
                className="input-field pl-12" 
                placeholder="User identifier..." 
                value={formData.username} 
                onChange={(e) => setFormData({...formData, username: e.target.value})} 
               />
            </div>
          </div>
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">{userToEdit ? 'New Password (Leave blank to keep)' : 'System Password'}</label>
            <div className="relative">
               <Key className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
               <input 
                type="password" 
                className="input-field pl-12" 
                placeholder="••••••••" 
                value={formData.password} 
                onChange={(e) => setFormData({...formData, password: e.target.value})} 
               />
            </div>
          </div>
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Access Authorization</label>
            <div className="relative">
               <Shield className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 pointer-events-none" />
               <select 
                className="input-field pl-12 appearance-none" 
                value={formData.role} 
                onChange={(e) => setFormData({...formData, role: e.target.value})}
               >
                 <option value="viewer">Viewer (Employee Access)</option>
                 <option value="uploader">Uploader (Batch Control)</option>
                 <option value="admin">Admin (Full System Control)</option>
               </select>
            </div>
          </div>
          
          <div className="flex gap-4 pt-4">
             <button type="button" onClick={onClose} className="flex-1 py-4 font-black text-slate-400 hover:text-slate-900">Discard</button>
             <button type="submit" disabled={loading} className="flex-[2] py-4 bg-primary-600 text-white rounded-2xl font-black shadow-xl shadow-primary-200">
               {loading ? 'Processing...' : userToEdit ? 'Commit Changes' : 'Provision Account'}
             </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default Accounts;
