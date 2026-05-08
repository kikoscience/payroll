import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, Users, FileText, Settings, LogOut, Briefcase, BarChart, Layers, Tag, User as UserIcon } from 'lucide-react';

const Sidebar = () => {
  const { user, logout } = useAuth();

  const links = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/' },
    { name: 'Payroll Tasks', icon: Briefcase, path: '/tasks' },
    { name: 'Employee Registry', icon: Users, path: '/employees' },
    { name: 'Monthly Payroll', icon: Layers, path: '/payroll-batches' },
    { name: 'Other Receivables', icon: FileText, path: '/other-receivables' },
    { name: 'Reports', icon: BarChart, path: '/reports' },
    { name: 'Payroll Settings', icon: Tag, path: '/payroll-settings' },
  ];

  if (user?.role === 'admin') {
    links.push({ name: 'Accounts', icon: UserIcon, path: '/accounts' });
  }

  return (
    <div className="w-72 bg-white border-r border-slate-200 flex flex-col h-screen sticky top-0">
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
            {user?.name?.charAt(0)}
          </div>
          <div className="overflow-hidden">
            <p className="text-sm font-bold text-slate-900 truncate">{user?.name}</p>
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
  );
};

export default Sidebar;
