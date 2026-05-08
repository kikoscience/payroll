import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, Users, FileText, Settings, LogOut, 
  Briefcase, BarChart, Layers, Tag, User as UserIcon, Menu, X, ShieldCheck 
} from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const Sidebar = () => {
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  let links = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/' },
    { name: 'Payroll Tasks', icon: Briefcase, path: '/tasks' },
    { name: 'Employee Registry', icon: Users, path: '/employees' },
    { name: 'Monthly Payroll', icon: Layers, path: '/payroll-batches' },
    { name: 'Other Receivables', icon: FileText, path: '/other-receivables' },
    { name: 'Reports', icon: BarChart, path: '/reports' },
    { name: 'Payroll Settings', icon: Tag, path: '/payroll-settings' },
    { name: 'Audit Logs', icon: ShieldCheck, path: '/audit' },
    { name: 'Settings', icon: Settings, path: '/settings' },
  ];

  if (user?.role === 'viewer') {
    links = [
      { name: 'Dashboard', icon: LayoutDashboard, path: '/' },
      { name: 'Payroll Tasks', icon: Briefcase, path: '/tasks' },
      { name: 'Settings', icon: Settings, path: '/settings' },
    ];
  } else if (user?.role === 'admin') {
    links.push({ name: 'Accounts', icon: UserIcon, path: '/accounts' });
  }

  return (
    <>
      {/* --- DESKTOP SIDEBAR --- */}
      <div className="hidden lg:flex w-72 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex-col h-screen sticky top-0 transition-colors duration-300">
        <div className="p-8">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center shadow-lg shadow-primary-200">
              <span className="text-white font-black text-xl">P</span>
            </div>
            <div>
              <h1 className="text-xl font-black text-slate-900 tracking-tight">Antigravity</h1>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Payroll System</p>
            </div>
          </div>

          <nav className="space-y-1">
            {links.map((link) => (
              <NavLink
                key={link.path}
                to={link.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                    isActive
                      ? 'bg-primary-50 text-primary-600'
                      : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
                  }`
                }
              >
                <link.icon className={`w-5 h-5 transition-colors`} />
                <span className="font-bold text-sm tracking-tight">{link.name}</span>
              </NavLink>
            ))}
          </nav>
        </div>

        <div className="mt-auto p-8 border-t border-slate-100">
          <div className="flex items-center gap-3 mb-6 p-2">
            <div className="w-10 h-10 rounded-full bg-slate-100 border-2 border-white shadow-sm flex items-center justify-center font-bold text-slate-600">
              {user?.fullName?.charAt(0) || user?.username?.charAt(0)}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-bold text-slate-900 truncate">{user?.fullName || user?.username}</p>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest truncate">{user?.role}</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-slate-500 hover:bg-red-50 hover:text-red-600 transition-all duration-200 font-bold text-sm"
          >
            <LogOut className="w-5 h-5" />
            Logout
          </button>
        </div>
      </div>

      {/* --- MOBILE BOTTOM NAV (For Employees/General) --- */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-[100] bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-t border-slate-100 dark:border-slate-800 px-6 py-3 pb-8 flex justify-around items-center shadow-[0_-8px_30px_rgb(0,0,0,0.04)] transition-colors duration-300">
        {links.slice(0, 4).map((link) => (
          <NavLink
            key={link.path}
            to={link.path}
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 transition-all ${
                isActive ? 'text-primary-600' : 'text-slate-400 dark:text-slate-500'
              }`
            }
          >
            <link.icon className="w-6 h-6" />
            <span className="text-[9px] font-black uppercase tracking-widest">{link.name.split(' ')[0]}</span>
          </NavLink>
        ))}
        
        {/* Mobile Menu Trigger */}
        <button 
          onClick={() => setIsOpen(true)}
          className="flex flex-col items-center gap-1 text-slate-400 dark:text-slate-500"
        >
          <Menu className="w-6 h-6" />
          <span className="text-[9px] font-black uppercase tracking-widest">More</span>
        </button>
      </div>

      {/* --- MOBILE FULLSCREEN OVERLAY MENU --- */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            className="lg:hidden fixed inset-0 z-[200] bg-slate-900 text-white p-8 flex flex-col"
          >
            <div className="flex justify-between items-center mb-12">
               <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center font-black">P</div>
                  <h1 className="text-xl font-black">Payroll Menu</h1>
               </div>
               <button onClick={() => setIsOpen(false)} className="p-2 bg-slate-800 rounded-full"><X className="w-6 h-6" /></button>
            </div>

            <nav className="flex-1 space-y-4">
               {links.map((link) => (
                 <NavLink
                   key={link.path}
                   to={link.path}
                   onClick={() => setIsOpen(false)}
                   className="flex items-center gap-6 p-4 bg-slate-800/50 rounded-3xl border border-slate-700/50"
                 >
                   <link.icon className="w-8 h-8 text-primary-400" />
                   <span className="text-lg font-bold">{link.name}</span>
                 </NavLink>
               ))}
            </nav>

            <div className="mt-8 pt-8 border-t border-slate-800">
               <div className="flex items-center gap-4 mb-8">
                  <div className="w-12 h-12 rounded-full bg-primary-600 flex items-center justify-center font-bold text-xl uppercase">{user?.fullName?.charAt(0)}</div>
                  <div>
                    <p className="text-lg font-black">{user?.fullName}</p>
                    <p className="text-sm font-bold text-slate-500 uppercase">{user?.role}</p>
                  </div>
               </div>
               <button onClick={logout} className="w-full py-5 bg-red-600/10 text-red-500 rounded-3xl font-black flex items-center justify-center gap-3">
                  <LogOut className="w-6 h-6" /> Logout from System
               </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Sidebar;
