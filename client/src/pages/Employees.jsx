import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Plus, Search, Filter, Trash2, Edit3, UserPlus, Info, Phone, ShieldAlert, Heart, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';

const Employees = () => {
  const { user } = useAuth();
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  
  // Pagination State
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const limit = 10;

  useEffect(() => {
    fetchEmployees();
  }, [page, searchTerm]);

  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`/api/employees?page=${page}&limit=${limit}&search=${searchTerm}`);
      setEmployees(res.data.data);
      setTotalPages(res.data.pagination.totalPages);
      setTotalRecords(res.data.pagination.total);
    } catch (err) {
      console.error('Error fetching employees', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setPage(1); // Reset to first page on search
  };

  const handleDelete = async (id) => {
    if (!window.confirm(`Delete employee ${id}? This action is permanent.`)) return;
    try {
      await axios.delete(`/api/employees/${id}`);
      fetchEmployees();
    } catch (err) {
      alert('Error deleting employee. Only Admins can perform this action.');
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Employee Registry</h1>
          <p className="text-slate-500">Corporate database management for staff records</p>
        </div>
        
        {(user?.role === 'admin' || user?.role === 'uploader') && (
          <button 
            onClick={() => { setEditingEmployee(null); setIsModalOpen(true); }}
            className="btn-primary flex items-center gap-2"
          >
            <UserPlus className="w-5 h-5" />
            New Employee
          </button>
        )}
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search by name, ID, or department..." 
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-primary-500/20"
              value={searchTerm}
              onChange={handleSearchChange}
            />
          </div>
          <div className="text-sm font-medium text-slate-500">
            Total Records: <span className="text-slate-900">{totalRecords}</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 text-slate-500 text-xs font-bold uppercase tracking-wider">
                <th className="px-6 py-4">ID Number</th>
                <th className="px-6 py-4">Full Name</th>
                <th className="px-6 py-4">Position</th>
                <th className="px-6 py-4">Dept / Unit</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="5" className="px-6 py-20 text-center">
                    <div className="flex flex-col items-center justify-center gap-2">
                        <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
                        <p className="text-slate-400 font-medium">Fetching records...</p>
                    </div>
                  </td>
                </tr>
              ) : employees.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-10 text-center text-slate-400 font-medium">No records matching search</td>
                </tr>
              ) : (
                employees.map((emp) => (
                  <tr key={emp.IdNumber} className="hover:bg-slate-50/50 transition-all group">
                    <td className="px-6 py-4 font-mono text-sm text-slate-600">
                      {emp.IdNumber}
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-semibold text-slate-900">{emp.FullName}</p>
                      <p className="text-xs text-slate-400">{emp.DateOfBirth ? new Date(emp.DateOfBirth).toLocaleDateString() : 'No DOB'}</p>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-700">
                      {emp.Position}
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-slate-900 font-medium">{emp.Department || 'N/A'}</p>
                      <p className="text-xs text-slate-500">{emp.Unit || '-'}</p>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {(user?.role === 'admin' || user?.role === 'uploader') && (
                          <button 
                            onClick={() => { setEditingEmployee(emp); setIsModalOpen(true); }}
                            className="p-2 text-slate-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-all"
                          >
                            <Edit3 className="w-5 h-5" />
                          </button>
                        )}
                        {user?.role === 'admin' && (
                          <button 
                            onClick={() => handleDelete(emp.IdNumber)}
                            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                          >
                            <Trash2 className="w-5 h-5" />
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

        {/* Pagination Controls */}
        {!loading && totalPages > 0 && (
          <div className="p-6 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between">
            <div className="text-sm text-slate-500 font-medium">
              Page <span className="text-slate-900">{page}</span> of <span className="text-slate-900">{totalPages}</span>
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setPage(prev => Math.max(1, prev - 1))}
                disabled={page === 1}
                className="p-2 bg-white border border-slate-200 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 transition-colors"
              >
                <ChevronLeft className="w-5 h-5 text-slate-600" />
              </button>
              
              <div className="flex items-center gap-1">
                {/* Simplified page numbers - current, next, previous */}
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) pageNum = i + 1;
                    else if (page <= 3) pageNum = i + 1;
                    else if (page >= totalPages - 2) pageNum = totalPages - 4 + i;
                    else pageNum = page - 2 + i;
                    
                    return (
                        <button
                            key={pageNum}
                            onClick={() => setPage(pageNum)}
                            className={`w-10 h-10 rounded-lg text-sm font-bold transition-all ${page === pageNum ? 'bg-primary-600 text-white shadow-lg shadow-primary-200' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                        >
                            {pageNum}
                        </button>
                    )
                })}
              </div>

              <button 
                onClick={() => setPage(prev => Math.min(totalPages, prev + 1))}
                disabled={page === totalPages}
                className="p-2 bg-white border border-slate-200 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 transition-colors"
              >
                <ChevronRight className="w-5 h-5 text-slate-600" />
              </button>
            </div>
          </div>
        )}
      </div>

      <EmployeeModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSuccess={fetchEmployees}
        employee={editingEmployee}
      />
    </div>
  );
};

const EmployeeModal = ({ isOpen, onClose, onSuccess, employee }) => {
  const initialForm = {
    IdNumber: '', FullName: '', Position: '', Department: '', Unit: '', DateOfBirth: '',
    GsisBpNo: '', PagIbigMidNo: '', PhicNo: '', TinNo: '', BloodType: '', MedicalConditions: '',
    EmergencyContactPerson: '', EmergencyContactNumber: '', EmergencyContactAddress: ''
  };
  
  const [formData, setFormData] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('personal');

  useEffect(() => {
    if (employee) {
      // Format date for input field safely
      let formattedDate = '';
      if (employee.DateOfBirth) {
        try {
          formattedDate = new Date(employee.DateOfBirth).toISOString().split('T')[0];
        } catch (e) {
          console.error('Date parsing error', e);
        }
      }
      setFormData({ ...employee, DateOfBirth: formattedDate });
    } else {
      setFormData(initialForm);
    }
  }, [employee, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (employee) {
        await axios.put(`/api/employees/${employee.IdNumber}`, formData);
      } else {
        await axios.post('/api/employees', formData);
      }
      onSuccess();
      onClose();
    } catch (err) {
      alert('Error saving record. Check if ID Number is unique.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        <div className="p-6 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-slate-900">{employee ? 'Edit Record' : 'Create Registry Entry'}</h2>
            <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Employee ID: {formData.IdNumber || 'NEW'}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white rounded-full text-slate-400 transition-colors">&times;</button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-100">
          <button 
            type="button"
            onClick={() => setActiveTab('personal')}
            className={`flex-1 py-3 text-sm font-bold flex items-center justify-center gap-2 transition-all ${activeTab === 'personal' ? 'text-primary-600 border-b-2 border-primary-600 bg-primary-50/30' : 'text-slate-400'}`}
          >
            <Info className="w-4 h-4" /> Personal
          </button>
          <button 
            type="button"
            onClick={() => setActiveTab('ids')}
            className={`flex-1 py-3 text-sm font-bold flex items-center justify-center gap-2 transition-all ${activeTab === 'ids' ? 'text-primary-600 border-b-2 border-primary-600 bg-primary-50/30' : 'text-slate-400'}`}
          >
            <ShieldAlert className="w-4 h-4" /> Identifiers
          </button>
          <button 
            type="button"
            onClick={() => setActiveTab('emergency')}
            className={`flex-1 py-3 text-sm font-bold flex items-center justify-center gap-2 transition-all ${activeTab === 'emergency' ? 'text-primary-600 border-b-2 border-primary-600 bg-primary-50/30' : 'text-slate-400'}`}
          >
            <Phone className="w-4 h-4" /> Emergency
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          {activeTab === 'personal' && (
            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">ID Number</label>
                  <input required disabled={!!employee} className="input-field disabled:bg-slate-50" value={formData.IdNumber} onChange={(e) => setFormData({...formData, IdNumber: e.target.value})} />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Date of Birth</label>
                  <input type="date" className="input-field" value={formData.DateOfBirth} onChange={(e) => setFormData({...formData, DateOfBirth: e.target.value})} />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Full Name</label>
                <input required className="input-field" value={formData.FullName} onChange={(e) => setFormData({...formData, FullName: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Department</label>
                  <input className="input-field" value={formData.Department} onChange={(e) => setFormData({...formData, Department: e.target.value})} />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Unit</label>
                  <input className="input-field" value={formData.Unit} onChange={(e) => setFormData({...formData, Unit: e.target.value})} />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Position</label>
                <input className="input-field" value={formData.Position} onChange={(e) => setFormData({...formData, Position: e.target.value})} />
              </div>
            </div>
          )}

          {activeTab === 'ids' && (
            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">GSIS BP No</label>
                  <input className="input-field" value={formData.GsisBpNo} onChange={(e) => setFormData({...formData, GsisBpNo: e.target.value})} />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Pag-Ibig MID</label>
                  <input className="input-field" value={formData.PagIbigMidNo} onChange={(e) => setFormData({...formData, PagIbigMidNo: e.target.value})} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">PHIC No</label>
                  <input className="input-field" value={formData.PhicNo} onChange={(e) => setFormData({...formData, PhicNo: e.target.value})} />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">TIN No</label>
                  <input className="input-field" value={formData.TinNo} onChange={(e) => setFormData({...formData, TinNo: e.target.value})} />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-1">
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Blood Type</label>
                  <input className="input-field" value={formData.BloodType} onChange={(e) => setFormData({...formData, BloodType: e.target.value})} />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Medical Conditions</label>
                  <input className="input-field" value={formData.MedicalConditions} onChange={(e) => setFormData({...formData, MedicalConditions: e.target.value})} />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'emergency' && (
            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Contact Person</label>
                <input className="input-field" value={formData.EmergencyContactPerson} onChange={(e) => setFormData({...formData, EmergencyContactPerson: e.target.value})} />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Contact Number</label>
                <input className="input-field" value={formData.EmergencyContactNumber} onChange={(e) => setFormData({...formData, EmergencyContactNumber: e.target.value})} />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Address</label>
                <textarea rows="3" className="input-field" value={formData.EmergencyContactAddress} onChange={(e) => setFormData({...formData, EmergencyContactAddress: e.target.value})} />
              </div>
            </div>
          )}
        </form>

        <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
          <button type="button" onClick={onClose} className="px-6 py-2.5 text-sm font-bold text-slate-600 hover:bg-white rounded-xl border border-slate-200 transition-all">Cancel</button>
          <button onClick={handleSubmit} disabled={loading} className="btn-primary px-8">
            {loading ? 'Saving...' : 'Save Record'}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default Employees;
