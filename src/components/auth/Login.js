import React, { useState } from 'react';
import axios from 'axios';

function Login({ onLogin }) {
    const [isLogin, setIsLogin] = useState(true);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [phone, setPhone] = useState('');
    const [email, setEmail] = useState('');
    const [role, setRole] = useState('CUSTOMER');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            if (isLogin) {
                const response = await axios.post('http://localhost:5000/api/auth/login', { username, password });
                if (response.data.success) {
                    localStorage.setItem('token', response.data.token);
                    onLogin(response.data.user);
                } else {
                    setError('Invalid credentials');
                }
            } else {
                const response = await axios.post('http://localhost:5000/api/auth/register', {
                    full_name: fullName, username, password, role, phone, email
                });
                if (response.data.success) {
                    setError(response.data.message || 'Registration successful! Please login.');
                    setIsLogin(true);
                    setFullName('');
                    setUsername('');
                    setPassword('');
                    setPhone('');
                    setEmail('');
                } else {
                    setError(response.data.error || 'Registration failed');
                }
            }
        } catch (err) {
            setError(err.response?.data?.error || 'Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-container">
            <div className="login-card">
                <div className="login-icon">💈</div>
                <h1 className="login-title">LEVIS.BARBER</h1>
                <p className="login-subtitle">Financial Information System</p>

                <div className="login-tabs">
                    <button className={`tab-btn ${isLogin ? 'active' : ''}`} onClick={() => setIsLogin(true)}>Login</button>
                    <button className={`tab-btn ${!isLogin ? 'active' : ''}`} onClick={() => setIsLogin(false)}>Register</button>
                </div>

                {error && <div className="error-message">{error}</div>}

                <form onSubmit={handleSubmit}>
                    {!isLogin && (
                        <>
                            <input type="text" className="input-field" placeholder="Full Name" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
                            <input type="text" className="input-field" placeholder="Phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
                            <input type="email" className="input-field" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
                        </>
                    )}
                    <input type="text" className="input-field" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} required />
                    <input type="password" className="input-field" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                    
                    {!isLogin && (
                        <select className="input-field" value={role} onChange={(e) => setRole(e.target.value)}>
                            <option value="CUSTOMER">Customer</option>
                            <option value="EMPLOYEE">Employee</option>
                        </select>
                    )}
                    
                    <button type="submit" className="btn-orange" disabled={loading}>
                        {loading ? 'Processing...' : (isLogin ? 'Login' : 'Register')}
                    </button>
                </form>
                
                {isLogin && <p className="demo-text">Demo: owner / owner123</p>}
            </div>
        </div>
    );
}

export default Login;