import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Plus, Search, Filter, MoreVertical, Trash2, Edit3, EyeOff, Eye } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Dashboard = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const res = await axios.get('/api/tasks');
      setTasks(res.data);
    } catch (err) {
      console.error('Error fetching tasks', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;
    try {
      await axios.delete(`/api/tasks/${id}`);
      fetchTasks();
    } catch (err) {
      alert('Error deleting task');
    }
  };

  const handleToggleStatus = async (task) => {
    const newStatus = task.status === 'disabled' ? 'active' : 'disabled';
    try {
      await axios.patch(`/api/tasks/${task.id}/status`, { status: newStatus });
      fetchTasks();
    } catch (err) {
      alert('Error updating status');
    }
  };

  const filteredTasks = (tasks || []).filter(t => 
    (t.title?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (t.description?.toLowerCase() || '').includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Payroll Tasks</h1>
          <p className="text-slate-500">Manage and oversee all payroll processing items</p>
        </div>
        
        {(user?.role === 'admin' || user?.role === 'uploader') && (
          <button 
            onClick={() => { setEditingTask(null); setIsModalOpen(true); }}
            className="btn-primary flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Create New Task
          </button>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-sm font-medium text-slate-500 mb-1">Total Tasks</p>
          <p className="text-3xl font-bold text-slate-900">{tasks.length}</p>
        </div>
        <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-sm font-medium text-slate-500 mb-1">Active Tasks</p>
          <p className="text-3xl font-bold text-emerald-600">{tasks.filter(t => t.status !== 'disabled').length}</p>
        </div>
        <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-sm font-medium text-slate-500 mb-1">Disabled Items</p>
          <p className="text-3xl font-bold text-slate-400">{tasks.filter(t => t.status === 'disabled').length}</p>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search tasks..." 
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-primary-500/20"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 transition-all">
            <Filter className="w-5 h-5" />
            Filters
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 text-slate-500 text-xs font-bold uppercase tracking-wider">
                <th className="px-6 py-4">Task Info</th>
                <th className="px-6 py-4">Amount</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Created By</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="5" className="px-6 py-10 text-center text-slate-400">Loading tasks...</td>
                </tr>
              ) : filteredTasks.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-10 text-center text-slate-400">No tasks found</td>
                </tr>
              ) : (
                filteredTasks.map((task) => (
                  <tr key={task.id} className={`hover:bg-slate-50/50 transition-all ${task.status === 'disabled' ? 'opacity-50' : ''}`}>
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-semibold text-slate-900">{task.title}</p>
                        <p className="text-xs text-slate-500 truncate max-w-xs">{task.description}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-medium text-slate-900">${task.amount?.toFixed(2)}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        task.status === 'disabled' 
                        ? 'bg-slate-100 text-slate-600' 
                        : 'bg-emerald-100 text-emerald-700'
                      }`}>
                        {task.status || 'active'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500">
                      {task.createdBy}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {(user?.role === 'admin' || user?.role === 'uploader') && (
                          <>
                            <button 
                              onClick={() => handleToggleStatus(task)}
                              title={task.status === 'disabled' ? 'Enable' : 'Disable'}
                              className="p-2 text-slate-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-all"
                            >
                              {task.status === 'disabled' ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
                            </button>
                            <button 
                              onClick={() => { setEditingTask(task); setIsModalOpen(true); }}
                              className="p-2 text-slate-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-all"
                            >
                              <Edit3 className="w-5 h-5" />
                            </button>
                          </>
                        )}
                        {user?.role === 'admin' && (
                          <button 
                            onClick={() => handleDelete(task.id)}
                            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        )}
                        {user?.role === 'viewer' && (
                          <span className="text-xs text-slate-300">View Only</span>
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

      <TaskModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSuccess={fetchTasks}
        task={editingTask}
      />
    </div>
  );
};

const TaskModal = ({ isOpen, onClose, onSuccess, task }) => {
  const [formData, setFormData] = useState({ title: '', description: '', amount: '', status: 'active' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (task) {
      setFormData({ title: task.title, description: task.description, amount: task.amount, status: task.status });
    } else {
      setFormData({ title: '', description: '', amount: '', status: 'active' });
    }
  }, [task, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (task) {
        await axios.put(`/api/tasks/${task.id}`, formData);
      } else {
        await axios.post('/api/tasks', formData);
      }
      onSuccess();
      onClose();
    } catch (err) {
      alert('Error saving task');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden"
      >
        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
          <h2 className="text-xl font-bold text-slate-900">{task ? 'Edit Task' : 'New Payroll Task'}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">&times;</button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Title</label>
            <input 
              required
              className="input-field"
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
            <textarea 
              className="input-field min-h-[100px]"
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Amount ($)</label>
              <input 
                type="number"
                step="0.01"
                className="input-field"
                value={formData.amount}
                onChange={(e) => setFormData({...formData, amount: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
              <select 
                className="input-field"
                value={formData.status}
                onChange={(e) => setFormData({...formData, status: e.target.value})}
              >
                <option value="active">Active</option>
                <option value="disabled">Disabled</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <button type="button" onClick={onClose} className="px-4 py-2 text-slate-600 hover:bg-slate-50 rounded-lg">Cancel</button>
            <button type="submit" disabled={loading} className="btn-primary">
              {loading ? 'Saving...' : 'Save Task'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default Dashboard;
