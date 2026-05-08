import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Employees from './pages/Employees';
import PayrollBatches from './pages/PayrollBatches';
import OtherReceivables from './pages/OtherReceivables';
import BatchLabelSettings from './pages/BatchLabelSettings';
import Sidebar from './components/Sidebar';

const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div>Loading...</div>;
  return user ? <div className="flex bg-slate-50 min-h-screen">
    <Sidebar />
    <main className="flex-1 p-8 overflow-y-auto">{children}</main>
  </div> : <Navigate to="/login" />;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
          <Route path="/tasks" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
          <Route path="/employees" element={<PrivateRoute><Employees /></PrivateRoute>} />
          <Route path="/payroll-batches" element={<PrivateRoute><PayrollBatches /></PrivateRoute>} />
          <Route path="/other-receivables" element={<PrivateRoute><OtherReceivables /></PrivateRoute>} />
          <Route path="/payroll-settings" element={<PrivateRoute><BatchLabelSettings /></PrivateRoute>} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
