import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { ThemeProvider } from './context/ThemeContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Employees from './pages/Employees';
import PayrollBatches from './pages/PayrollBatches';
import OtherReceivables from './pages/OtherReceivables';
import BatchLabelSettings from './pages/BatchLabelSettings';
import Accounts from './pages/Accounts';
import PayrollTasks from './pages/PayrollTasks';
import AuditLogs from './pages/AuditLogs';
import Settings from './pages/Settings';
import Sidebar from './components/Sidebar';

const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div>Loading...</div>;
  return user ? <div className="flex flex-col lg:flex-row bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 min-h-screen transition-colors duration-300">
    <Sidebar />
    <main className="flex-1 p-4 md:p-8 pb-32 lg:pb-8 overflow-y-auto w-full">{children}</main>
  </div> : <Navigate to="/login" />;
};

function App() {
  return (
    <ToastProvider>
      <ThemeProvider>
        <AuthProvider>
          <Router>
            <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
            <Route path="/tasks" element={<PrivateRoute><PayrollTasks /></PrivateRoute>} />
            <Route path="/employees" element={<PrivateRoute><Employees /></PrivateRoute>} />
            <Route path="/payroll-batches" element={<PrivateRoute><PayrollBatches /></PrivateRoute>} />
            <Route path="/other-receivables" element={<PrivateRoute><OtherReceivables /></PrivateRoute>} />
            <Route path="/payroll-settings" element={<PrivateRoute><BatchLabelSettings /></PrivateRoute>} />
            <Route path="/accounts" element={<PrivateRoute><Accounts /></PrivateRoute>} />
            <Route path="/audit" element={<PrivateRoute><AuditLogs /></PrivateRoute>} />
            <Route path="/settings" element={<PrivateRoute><Settings /></PrivateRoute>} />
          </Routes>
        </Router>
      </AuthProvider>
     </ThemeProvider>
    </ToastProvider>
  );
}

export default App;
