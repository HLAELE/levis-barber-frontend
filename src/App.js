import React, { useState, useEffect } from 'react';
import LandingPage from './components/LandingPage';
import Login from './components/auth/Login';
import OwnerDashboard from './components/owner/OwnerDashboard';
import EmployeeDashboard from './components/employee/EmployeeDashboard';
import CustomerDashboard from './components/customer/CustomerDashboard';
import './App.css';

function App() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const payload = JSON.parse(atob(token.split('.')[1]));
                setUser({
                    userId: payload.userId,
                    username: payload.username,
                    role: payload.role,
                    full_name: payload.full_name
                });
            } catch (error) {
                localStorage.removeItem('token');
            }
        }
        setLoading(false);
    }, []);

    const [showLogin, setShowLogin] = useState(false);
    const handleLogin = (userData) => setUser(userData);
    const handleLogout = () => { localStorage.removeItem('token'); setUser(null); };

    if (loading) return <div className="login-container"><div className="login-card"><h2>Loading...</h2></div></div>;
    if (!user && !showLogin) return <LandingPage onStart={() => setShowLogin(true)} />;
    if (!user) return <Login onLogin={handleLogin} onBack={() => setShowLogin(false)} />;
    if (user.role === 'OWNER') return <OwnerDashboard user={user} onLogout={handleLogout} />;
    if (user.role === 'EMPLOYEE') return <EmployeeDashboard user={user} onLogout={handleLogout} />;
    return <CustomerDashboard user={user} onLogout={handleLogout} />;
}

export default App;