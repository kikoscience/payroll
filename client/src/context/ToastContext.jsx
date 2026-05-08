import React, { createContext, useContext, useState, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react';

const ToastContext = createContext();

export const useToast = () => useContext(ToastContext);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'info') => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => removeToast(id), 5000);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ success: (m) => addToast(m, 'success'), error: (m) => addToast(m, 'error'), info: (m) => addToast(m, 'info') }}>
      {children}
      
      {/* Toast Container */}
      <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3 pointer-events-none">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 50, scale: 0.8, x: 20 }}
              animate={{ opacity: 1, y: 0, scale: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.2 } }}
              layout
              className="pointer-events-auto"
            >
              <div className={`
                flex items-center gap-4 px-6 py-4 rounded-2xl shadow-2xl border min-w-[320px] max-w-md
                ${toast.type === 'success' ? 'bg-white border-green-100 text-green-900' : ''}
                ${toast.type === 'error' ? 'bg-white border-red-100 text-red-900' : ''}
                ${toast.type === 'info' ? 'bg-white border-blue-100 text-blue-900' : ''}
              `}>
                <div className={`
                  p-2 rounded-xl
                  ${toast.type === 'success' ? 'bg-green-50 text-green-600' : ''}
                  ${toast.type === 'error' ? 'bg-red-50 text-red-600' : ''}
                  ${toast.type === 'info' ? 'bg-blue-50 text-blue-600' : ''}
                `}>
                  {toast.type === 'success' && <CheckCircle className="w-5 h-5" />}
                  {toast.type === 'error' && <AlertCircle className="w-5 h-5" />}
                  {toast.type === 'info' && <Info className="w-5 h-5" />}
                </div>
                
                <div className="flex-1 pr-4">
                   <p className="text-sm font-black leading-tight">{toast.message}</p>
                </div>

                <button onClick={() => removeToast(toast.id)} className="p-1 hover:bg-slate-50 rounded-lg text-slate-300 hover:text-slate-900 transition-all">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
};
