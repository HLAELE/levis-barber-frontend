import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

function OwnerDashboard({ user, onLogout }) {
    const [stats, setStats] = useState({ totalRevenue: 0, totalExpenses: 0, netProfit: 0, totalCustomers: 0 });
    const [employees, setEmployees] = useState([]);
    const [income, setIncome] = useState([]);
    const [expenses, setExpenses] = useState([]);
    const [complaints, setComplaints] = useState([]);
    const [chartData, setChartData] = useState({ monthlyRevenue: [], revenueTotal: 0, expensesTotal: 0, salariesTotal: 0, categoryExpenses: [] });
    const [activeTab, setActiveTab] = useState('dashboard');
    const [showIncomeModal, setShowIncomeModal] = useState(false);
    const [showExpenseModal, setShowExpenseModal] = useState(false);
    const [showSalaryModal, setShowSalaryModal] = useState(false);
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const [salaryAmount, setSalaryAmount] = useState('');
    const [incomeData, setIncomeData] = useState({ source: '', amount: '', description: '', category: 'Other', payment_method: 'CASH', income_date: '' });
    const [expenseData, setExpenseData] = useState({ description: '', amount: '', category: 'Other', expense_date: '' });
    const [replyText, setReplyText] = useState({});

    const token = localStorage.getItem('token');

    const fetchDashboard = useCallback(async () => {
        try {
            const res = await axios.get(`${API_URL}/owner/dashboard`, { headers: { Authorization: `Bearer ${token}` } });
            setStats(res.data);
        } catch (error) { console.error(error); }
    }, [token]);

    const fetchChartData = useCallback(async () => {
        try {
            const res = await axios.get(`${API_URL}/owner/chart-data`, { headers: { Authorization: `Bearer ${token}` } });
            setChartData(res.data);
        } catch (error) { console.error(error); }
    }, [token]);

    const fetchIncome = useCallback(async () => {
        try {
            const res = await axios.get(`${API_URL}/owner/income`, { headers: { Authorization: `Bearer ${token}` } });
            setIncome(res.data);
        } catch (error) { console.error(error); }
    }, [token]);

    const fetchExpenses = useCallback(async () => {
        try {
            const res = await axios.get(`${API_URL}/owner/expenses`, { headers: { Authorization: `Bearer ${token}` } });
            setExpenses(res.data);
        } catch (error) { console.error(error); }
    }, [token]);

    const fetchEmployees = useCallback(async () => {
        try {
            const res = await axios.get(`${API_URL}/owner/employees`, { headers: { Authorization: `Bearer ${token}` } });
            setEmployees(res.data);
        } catch (error) { console.error(error); }
    }, [token]);

    const fetchComplaints = useCallback(async () => {
        try {
            const res = await axios.get(`${API_URL}/owner/complaints`, { headers: { Authorization: `Bearer ${token}` } });
            setComplaints(res.data);
        } catch (error) { console.error(error); }
    }, [token]);

    const addIncome = async () => {
        if (!incomeData.source || !incomeData.amount || incomeData.amount <= 0) {
            alert('Please fill source and valid amount');
            return;
        }
        try {
            await axios.post(`${API_URL}/owner/add-income`, incomeData, { headers: { Authorization: `Bearer ${token}` } });
            setShowIncomeModal(false);
            setIncomeData({ source: '', amount: '', description: '', category: 'Other', payment_method: 'CASH', income_date: '' });
            fetchIncome();
            fetchDashboard();
            fetchChartData();
            alert('Income added successfully');
        } catch (error) { console.error(error); alert('Failed to add income'); }
    };

    const addExpense = async () => {
        if (!expenseData.description || !expenseData.amount || expenseData.amount <= 0) {
            alert('Please fill description and valid amount');
            return;
        }
        try {
            await axios.post(`${API_URL}/owner/add-expense`, expenseData, { headers: { Authorization: `Bearer ${token}` } });
            setShowExpenseModal(false);
            setExpenseData({ description: '', amount: '', category: 'Other', expense_date: '' });
            fetchExpenses();
            fetchDashboard();
            fetchChartData();
            alert('Expense added successfully');
        } catch (error) { console.error(error); alert('Failed to add expense'); }
    };

    const paySalary = async () => {
        if (!selectedEmployee || !salaryAmount) return;
        try {
            await axios.post(`${API_URL}/owner/pay-salary`, { employee_id: selectedEmployee, amount: parseFloat(salaryAmount) }, { headers: { Authorization: `Bearer ${token}` } });
            setShowSalaryModal(false);
            setSelectedEmployee(null);
            setSalaryAmount('');
            fetchEmployees();
            fetchExpenses();
            fetchDashboard();
            fetchChartData();
            alert('Salary paid successfully');
        } catch (error) { console.error(error); alert('Failed to pay salary'); }
    };

    const deleteIncome = async (id) => {
        if (window.confirm('Delete this income record?')) {
            try {
                await axios.delete(`${API_URL}/owner/delete-income/${id}`, { headers: { Authorization: `Bearer ${token}` } });
                fetchIncome();
                fetchDashboard();
                fetchChartData();
            } catch (error) { console.error(error); }
        }
    };

    const deleteExpense = async (id) => {
        if (window.confirm('Delete this expense record?')) {
            try {
                await axios.delete(`${API_URL}/owner/delete-expense/${id}`, { headers: { Authorization: `Bearer ${token}` } });
                fetchExpenses();
                fetchDashboard();
                fetchChartData();
            } catch (error) { console.error(error); }
        }
    };

    const replyComplaint = async (id) => {
        if (!replyText[id]) return;
        try {
            await axios.post(`${API_URL}/owner/reply-complaint/${id}`, { reply: replyText[id] }, { headers: { Authorization: `Bearer ${token}` } });
            fetchComplaints();
            alert('Reply sent');
        } catch (error) { console.error(error); }
    };

    useEffect(() => {
        fetchDashboard();
        fetchChartData();
        fetchIncome();
        fetchExpenses();
        fetchEmployees();
        fetchComplaints();
    }, [fetchDashboard, fetchChartData, fetchIncome, fetchExpenses, fetchEmployees, fetchComplaints]);

    const totalIncome = income.reduce((sum, i) => sum + parseFloat(i.amount || 0), 0);
    const pieColors = ['#28a745', '#dc3545', '#ff6a00', '#17a2b8', '#ffc107', '#6f42c1'];
    const pieData = chartData.categoryExpenses.map((c, i) => ({ name: c.category, value: parseFloat(c.total), color: pieColors[i % pieColors.length] }));

    return (
        <div className="dashboard-container">
            <div className="sidebar">
                <div className="sidebar-logo">👑 LEVIS.BARBER</div>
                <div className="sidebar-nav">
                    <button className={`nav-btn ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={() => setActiveTab('dashboard')}>📊 Dashboard</button>
                    <button className={`nav-btn ${activeTab === 'income' ? 'active' : ''}`} onClick={() => setActiveTab('income')}>💰 Income</button>
                    <button className={`nav-btn ${activeTab === 'expenses' ? 'active' : ''}`} onClick={() => setActiveTab('expenses')}>📉 Expenses</button>
                    <button className={`nav-btn ${activeTab === 'employees' ? 'active' : ''}`} onClick={() => setActiveTab('employees')}>👔 Employees</button>
                    <button className={`nav-btn ${activeTab === 'complaints' ? 'active' : ''}`} onClick={() => setActiveTab('complaints')}>📝 Complaints</button>
                </div>
                <div className="sidebar-footer">
                    <div>👑 {user?.full_name}</div>
                    <button className="logout-btn" onClick={onLogout}>Logout</button>
                </div>
            </div>

            <div className="main-content">
                {activeTab === 'dashboard' && (
                    <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h2>Owner Dashboard</h2>
                            <div>
                                <button className="btn-orange" onClick={() => setShowIncomeModal(true)} style={{ marginRight: '10px', padding: '10px 20px' }}>➕ Add Income</button>
                                <button className="btn-danger" onClick={() => setShowExpenseModal(true)} style={{ padding: '10px 20px' }}>📉 Add Expense</button>
                            </div>
                        </div>
                        <div className="stats-grid">
                            <div className="stat-card"><div className="stat-icon">💰</div><div className="stat-value">M {stats.totalRevenue.toLocaleString()}</div><div>Total Revenue</div></div>
                            <div className="stat-card"><div className="stat-icon">📉</div><div className="stat-value">M {stats.totalExpenses.toLocaleString()}</div><div>Total Expenses</div></div>
                            <div className="stat-card"><div className="stat-icon">📈</div><div className="stat-value" style={{ color: stats.netProfit >= 0 ? '#4caf50' : '#f44336' }}>M {stats.netProfit.toLocaleString()}</div><div>Net Profit</div></div>
                            <div className="stat-card"><div className="stat-icon">👥</div><div className="stat-value">{stats.totalCustomers}</div><div>Total Customers</div></div>
                        </div>
                        <div className="charts-grid">
                            <div className="chart-card">
                                <h3>📈 Monthly Revenue Trend</h3>
                                <ResponsiveContainer width="100%" height={300}>
                                    <LineChart data={chartData.monthlyRevenue}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                                        <XAxis dataKey="month" stroke="#ff6a00" />
                                        <YAxis stroke="#ff6a00" />
                                        <Tooltip formatter={(v) => `M ${v.toLocaleString()}`} />
                                        <Line type="monotone" dataKey="revenue" stroke="#ff6a00" strokeWidth={3} />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                            <div className="chart-card">
                                <h3>🥧 Expenses Breakdown</h3>
                                <ResponsiveContainer width="100%" height={300}>
                                    <PieChart>
                                        <Pie data={pieData} cx="50%" cy="50%" label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`} outerRadius={100} dataKey="value">
                                            {pieData.map((e, i) => (<Cell key={i} fill={e.color} />))}
                                        </Pie>
                                        <Tooltip formatter={(v) => `M ${v.toLocaleString()}`} />
                                        <Legend />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                            <div className="chart-card">
                                <h3>📊 Revenue vs Expenses</h3>
                                <ResponsiveContainer width="100%" height={300}>
                                    <BarChart data={[{ name: 'Revenue', amount: chartData.revenueTotal }, { name: 'Expenses', amount: chartData.expensesTotal }]}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                                        <XAxis dataKey="name" stroke="#ff6a00" />
                                        <YAxis stroke="#ff6a00" />
                                        <Tooltip formatter={(v) => `M ${v.toLocaleString()}`} />
                                        <Bar dataKey="amount" fill="#ff6a00" radius={[8, 8, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'income' && (
                    <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                            <h2>Income Management</h2>
                            <button className="btn-orange" onClick={() => setShowIncomeModal(true)}>+ Add Manual Income</button>
                        </div>
                        <div className="stats-grid" style={{ gridTemplateColumns: '1fr' }}>
                            <div className="stat-card"><div className="stat-icon">💰</div><div className="stat-value">M {totalIncome.toLocaleString()}</div><div>Total Income</div></div>
                        </div>
                        <table className="data-table">
                            <thead><tr><th>Source</th><th>Amount (M)</th><th>Category</th><th>Method</th><th>Date</th><th>Action</th></tr></thead>
                            <tbody>
                                {income.map(i => (<tr key={i.id}><td>{i.source}</td><td>M {parseFloat(i.amount).toLocaleString()}</td><td>{i.category}</td><td>{i.payment_method}</td><td>{new Date(i.date).toLocaleDateString()}</td><td><button className="btn-danger" onClick={() => deleteIncome(i.id)}>Delete</button></td></tr>))}
                                {income.length === 0 && <tr><td colSpan="6">No income records</td></tr>}
                            </tbody>
                        </table>
                    </div>
                )}

                {activeTab === 'expenses' && (
                    <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                            <h2>Expense Management</h2>
                            <button className="btn-danger" onClick={() => setShowExpenseModal(true)}>+ Add Expense</button>
                        </div>
                        <div className="stats-grid" style={{ gridTemplateColumns: '1fr' }}>
                            <div className="stat-card"><div className="stat-icon">📉</div><div className="stat-value">M {stats.totalExpenses.toLocaleString()}</div><div>Total Expenses</div></div>
                        </div>
                        <table className="data-table">
                            <thead><tr><th>Description</th><th>Amount (M)</th><th>Category</th><th>Date</th><th>Action</th></tr></thead>
                            <tbody>
                                {expenses.map(e => (<tr key={e.id}><td>{e.description}</td><td>M {parseFloat(e.amount).toLocaleString()}</td><td>{e.category}</td><td>{new Date(e.date).toLocaleDateString()}</td><td><button className="btn-danger" onClick={() => deleteExpense(e.id)}>Delete</button></td></tr>))}
                                {expenses.length === 0 && <tr><td colSpan="5">No expense records</td></tr>}
                            </tbody>
                        </table>
                    </div>
                )}

                {activeTab === 'employees' && (
                    <div>
                        <h2>Employees & Salary Management</h2>
                        <table className="data-table">
                            <thead><tr><th>Name</th><th>Position</th><th>Salary (M)</th><th>Action</th></tr></thead>
                            <tbody>
                                {employees.map(e => (<tr key={e.employee_id}><td>{e.full_name}</td><td>{e.position || 'Barber'}</td><td>M {parseFloat(e.salary).toLocaleString()}</td><td><button className="btn-orange" onClick={() => { setSelectedEmployee(e.employee_id); setSalaryAmount(e.salary || 0); setShowSalaryModal(true); }}>Pay Salary</button></td></tr>))}
                                {employees.length === 0 && <tr><td colSpan="4">No employees</td></tr>}
                            </tbody>
                        </table>
                    </div>
                )}

                {activeTab === 'complaints' && (
                    <div>
                        <h2>Complaints</h2>
                        {complaints.map(c => (
                            <div key={c.complaint_id} className="complaint-card">
                                <strong>{c.sender_name} ({c.role})</strong>
                                <p><strong>{c.subject}</strong></p>
                                <p>{c.message}</p>
                                {c.reply ? <div className="reply-box"><strong>Reply:</strong> {c.reply}</div> : (
                                    <div><textarea className="input-field" placeholder="Write reply..." onChange={(e) => setReplyText({ ...replyText, [c.complaint_id]: e.target.value })} /><button className="btn-orange" onClick={() => replyComplaint(c.complaint_id)}>Send Reply</button></div>
                                )}
                            </div>
                        ))}
                        {complaints.length === 0 && <p>No complaints</p>}
                    </div>
                )}
            </div>

            {showIncomeModal && (<div className="modal"><div className="modal-content"><h3>Add Manual Income</h3><input type="text" className="input-field" placeholder="Source" value={incomeData.source} onChange={(e) => setIncomeData({ ...incomeData, source: e.target.value })} /><select className="input-field" value={incomeData.category} onChange={(e) => setIncomeData({ ...incomeData, category: e.target.value })}><option>Services</option><option>Retail</option><option>Rental</option><option>Sponsorship</option><option>Other</option></select><select className="input-field" value={incomeData.payment_method} onChange={(e) => setIncomeData({ ...incomeData, payment_method: e.target.value })}><option>CASH</option><option>CARD</option><option>MOBILE</option></select><input type="date" className="input-field" value={incomeData.income_date} onChange={(e) => setIncomeData({ ...incomeData, income_date: e.target.value })} /><input type="number" className="input-field" placeholder="Amount (M)" value={incomeData.amount} onChange={(e) => setIncomeData({ ...incomeData, amount: e.target.value })} /><input type="text" className="input-field" placeholder="Description" value={incomeData.description} onChange={(e) => setIncomeData({ ...incomeData, description: e.target.value })} /><button className="btn-orange" onClick={addIncome}>Save</button><button className="btn-danger" onClick={() => setShowIncomeModal(false)}>Cancel</button></div></div>)}

            {showExpenseModal && (<div className="modal"><div className="modal-content"><h3>Add Expense</h3><input type="text" className="input-field" placeholder="Description" value={expenseData.description} onChange={(e) => setExpenseData({ ...expenseData, description: e.target.value })} /><select className="input-field" value={expenseData.category} onChange={(e) => setExpenseData({ ...expenseData, category: e.target.value })}><option>Rent</option><option>Equipment</option><option>Supplies</option><option>Salary</option><option>Other</option></select><input type="date" className="input-field" value={expenseData.expense_date} onChange={(e) => setExpenseData({ ...expenseData, expense_date: e.target.value })} /><input type="number" className="input-field" placeholder="Amount (M)" value={expenseData.amount} onChange={(e) => setExpenseData({ ...expenseData, amount: e.target.value })} /><button className="btn-danger" onClick={addExpense}>Save Expense</button><button className="btn-success" onClick={() => setShowExpenseModal(false)}>Cancel</button></div></div>)}

            {showSalaryModal && (<div className="modal"><div className="modal-content"><h3>Pay Salary</h3><input type="number" className="input-field" placeholder="Amount (M)" value={salaryAmount} onChange={(e) => setSalaryAmount(e.target.value)} /><button className="btn-orange" onClick={paySalary}>Confirm Payment</button><button className="btn-danger" onClick={() => setShowSalaryModal(false)}>Cancel</button></div></div>)}
        </div>
    );
}

export default OwnerDashboard;