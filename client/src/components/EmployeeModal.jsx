import { useState, useEffect } from 'react';
import axios from 'axios';
import { Info, ShieldAlert, Phone, X } from 'lucide-react';
import { motion } from 'framer-motion';
import { useToast } from '../context/ToastContext';

const EmployeeModal = ({ isOpen, onClose, onSuccess, employee, defaultId }) => {
  const toast = useToast();
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
      let formattedDate = '';
      if (employee.DateOfBirth) {
        try {
          formattedDate = new Date(employee.DateOfBirth).toISOString().split('T')[0];
        } catch (e) {
          console.error('Date parsing error', e);
        }
      }
      setFormData({ ...employee, DateOfBirth: formattedDate });
    } else if (defaultId) {
      setFormData({ ...initialForm, IdNumber: defaultId });
    } else {
      setFormData(initialForm);
    }
  }, [employee, defaultId, isOpen]);

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);
    try {
      if (employee) {
        await axios.put(`/api/employees/${employee.IdNumber}`, formData);
      } else {
        await axios.post('/api/employees', formData);
      }
      if (onSuccess) onSuccess(formData);
      toast.success(employee ? 'Record updated!' : 'Employee registered successfully!');
      onClose();
    } catch (err) {
      const msg = err.response?.data?.message || 'Error saving record.';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
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
            <div className="space-y-4">
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
            <div className="space-y-4">
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
            <div className="space-y-4">
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

export default EmployeeModal;
