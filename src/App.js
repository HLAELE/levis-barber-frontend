import React, { useEffect, useState } from 'react';
import LandingPage from './components/LandingPage';
import Login from './components/auth/Login';
import OwnerDashboard from './components/owner/OwnerDashboard';
import EmployeeDashboard from './components/employee/EmployeeDashboard';
import CustomerDashboard from './components/customer/CustomerDashboard';
import './App.css';

function App() {
  const [page, setPage] = useState('landing');
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('levisUser');
    return stored ? JSON.parse(stored) : null;
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem('levisUser', JSON.stringify(user));
      setPage(user.role === 'OWNER' ? 'owner' : user.role === 'EMPLOYEE' ? 'employee' : 'customer');
    } else {
      localStorage.removeItem('levisUser');
      setPage('landing');
    }
  }, [user]);

  const handleLogin = (loggedUser) => {
    setUser(loggedUser);
    setPage(loggedUser.role === 'OWNER' ? 'owner' : loggedUser.role === 'EMPLOYEE' ? 'employee' : 'customer');
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('levisUser');
    setUser(null);
    setPage('landing');
  };

  const handleStart = () => setPage('login');

  return (
    <>
      {page === 'landing' && <LandingPage onStart={handleStart} />}
      {page === 'login' && <Login onLogin={handleLogin} onBack={() => setPage('landing')} />}
      {page === 'owner' && user && <OwnerDashboard user={user} onLogout={handleLogout} />}
      {page === 'employee' && user && <EmployeeDashboard user={user} onLogout={handleLogout} />}
      {page === 'customer' && user && <CustomerDashboard user={user} onLogout={handleLogout} />}
    </>
  );
}

export default App;
