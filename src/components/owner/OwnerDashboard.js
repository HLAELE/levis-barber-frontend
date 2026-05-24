import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import API_URL from '../../apiConfig';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

function OwnerDashboard({ user, onLogout }) {
    const [stats, setStats] = useState({ totalRevenue: 0, totalExpenses: 0, netProfit: 0, totalCustomers: 0 });
    const [pendingEmployees, setPendingEmployees] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [income, setIncome] = useState([]);
    const [complaints, setComplaints] = useState([]);
    const [chartData, setChartData] = useState({ monthlyRevenue: [], revenueTotal: 0, expensesTotal: 0, salariesTotal: 0 });
    const [activeTab, setActiveTab] = useState('dashboard');
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const [salaryAmount, setSalaryAmount] = useState('');
    const [replyText, setReplyText] = useState({});
    const [showSalaryModal, setShowSalaryModal] = useState(false);
    const [selectedComplaint, setSelectedComplaint] = useState(null);
    const [showExpenseModal, setShowExpenseModal] = useState(false);
    const [expenseData, setExpenseData] = useState({ amount: '', description: '', category: 'Equipment' });
    const [showIncomeModal, setShowIncomeModal] = useState(false);
    const [incomeData, setIncomeData] = useState({ amount: '', source: '', description: '', category: 'Other', payment_method: 'CASH' });

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

    const fetchPendingEmployees = useCallback(async () => {
        try {
            const res = await axios.get(`${API_URL}/owner/pending-employees`, { headers: { Authorization: `Bearer ${token}` } });
            setPendingEmployees(res.data);
        } catch (error) { console.error(error); }
    }, [token]);

    const fetchEmployees = useCallback(async () => {
        try {
            const res = await axios.get(`${API_URL}/owner/employees`, { headers: { Authorization: `Bearer ${token}` } });
            setEmployees(res.data);
        } catch (error) { console.error(error); }
    }, [token]);

    const fetchIncome = useCallback(async () => {
        try {
            const res = await axios.get(`${API_URL}/owner/income`, { headers: { Authorization: `Bearer ${token}` } });
            setIncome(res.data);
        } catch (error) { console.error(error); }
    }, [token]);

    const fetchComplaints = useCallback(async () => {
        try {
            const res = await axios.get(`${API_URL}/owner/complaints`, { headers: { Authorization: `Bearer ${token}` } });
            setComplaints(res.data);
        } catch (error) { console.error(error); }
    }, [token]);

    const approveEmployee = async (userId) => {
        try {
            await axios.post(`${API_URL}/owner/approve-employee/${userId}`, 
                { position: 'Barber', salary: 0, hire_date: new Date().toISOString().split('T')[0] },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            fetchPendingEmployees();
            fetchEmployees();
        } catch (error) { console.error(error); }
    };

    const rejectEmployee = async (userId) => {
        if (window.confirm('Are you sure you want to reject this employee registration?')) {
            try {
                await axios.delete(`${API_URL}/owner/reject-employee/${userId}`, { headers: { Authorization: `Bearer ${token}` } });
                fetchPendingEmployees();
            } catch (error) { console.error(error); }
        }
    };

    const paySalary = async () => {
        if (!selectedEmployee || !salaryAmount) return;
        try {
            await axios.post(`${API_URL}/owner/pay-salary`,
                { employee_id: selectedEmployee, amount: parseFloat(salaryAmount), description: 'Monthly salary' },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setSalaryAmount('');
            setSelectedEmployee(null);
            setShowSalaryModal(false);
            fetchDashboard();
            fetchChartData();
            fetchEmployees();
        } catch (error) { console.error(error); }
    };

    const submitExpense = async () => {
        if (!expenseData.amount || !expenseData.category) return;
        try {
            await axios.post(`${API_URL}/owner/add-expense`,
                { amount: parseFloat(expenseData.amount), description: expenseData.description, category: expenseData.category },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setExpenseData({ amount: '', description: '', category: 'Equipment' });
            setShowExpenseModal(false);
            fetchDashboard();
            fetchChartData();
        } catch (error) { 
            console.error(error); 
            alert(`Failed to add expense: ${error.response?.status === 404 ? 'Please restart the backend server!' : (error.response?.data?.error || error.message)}`); 
        }
    };

    const replyComplaint = async (complaintId) => {
        try {
            await axios.post(`${API_URL}/owner/reply-complaint/${complaintId}`,
                { reply: replyText[complaintId] },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            fetchComplaints();
            if (selectedComplaint && selectedComplaint.complaint_id === complaintId) {
                setSelectedComplaint({ ...selectedComplaint, reply: replyText[complaintId], status: 'REPLIED' });
            }
        } catch (error) { console.error(error); }
    };

    useEffect(() => {
        fetchDashboard();
        fetchChartData();
        fetchPendingEmployees();
        fetchEmployees();
        fetchIncome();
        fetchComplaints();
    }, [fetchDashboard, fetchChartData, fetchPendingEmployees, fetchEmployees, fetchIncome, fetchComplaints]);

    const formatM = (amount) => `M ${parseFloat(amount || 0).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;

    const pieColors = ['#dc3545', '#ff6a00', '#28a745', '#17a2b8', '#ffc107', '#6f42c1'];
    const pieData = chartData.categoryExpenses ? chartData.categoryExpenses.map((c, i) => ({
        name: c.category,
        value: parseFloat(c.total) || 0,
        color: pieColors[i % pieColors.length]
    })) : [];

    const barData = chartData.categoryExpenses ? chartData.categoryExpenses.map(c => ({
        name: c.category,
        amount: parseFloat(c.total) || 0
    })) : [];

    const totalIncome = income.reduce((sum, p) => sum + p.amount, 0);

    let runningTotal = 0;
    const incomeWithRunningTotal = [...income].reverse().map(p => {
        runningTotal += parseFloat(p.amount || 0);
        return { ...p, runningTotal };
    }).reverse();

    const submitIncome = async () => {
        if (!incomeData.amount || !incomeData.source) {
            alert('Please fill in the Amount and Source fields');
            return;
        }
        try {
            await axios.post(`${API_URL}/owner/add-income`,
                { amount: parseFloat(incomeData.amount), source: incomeData.source, description: incomeData.description, category: incomeData.category, payment_method: incomeData.payment_method },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setIncomeData({ amount: '', source: '', description: '', category: 'Other', payment_method: 'CASH' });
            setShowIncomeModal(false);
            fetchIncome();
            fetchDashboard();
            fetchChartData();
        } catch (error) {
            console.error(error);
            alert(`Failed to add income: ${error.response?.data?.error || error.message}`);
        }
    };

    return (
        <div className="dashboard-container">
            <div className="sidebar">
                <div className="sidebar-logo">👑 LEVIS.BARBER</div>
                <div className="sidebar-nav">
                    <button className={`nav-btn ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={() => setActiveTab('dashboard')}>📊 Dashboard</button>
                    <button className={`nav-btn ${activeTab === 'approvals' ? 'active' : ''}`} onClick={() => setActiveTab('approvals')}>✅ Approve Staff</button>
                    <button className={`nav-btn ${activeTab === 'employees' ? 'active' : ''}`} onClick={() => setActiveTab('employees')}>👔 Employees</button>
                    <button className={`nav-btn ${activeTab === 'income' ? 'active' : ''}`} onClick={() => setActiveTab('income')}>💰 Income</button>
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
                            <button className="btn-success" onClick={() => setShowExpenseModal(true)} style={{ padding: '10px 20px' }}>➕ Log New Expense</button>
                        </div>
                        <div className="stats-grid">
                            <div className="stat-card"><div className="stat-icon">💰</div><div className="stat-value">{formatM(stats.totalRevenue)}</div><div>Total Revenue</div></div>
                            <div className="stat-card"><div className="stat-icon">📉</div><div className="stat-value">{formatM(stats.totalExpenses)}</div><div>Total Expenses</div></div>
                            <div className="stat-card"><div className="stat-icon">📈</div><div className="stat-value" style={{ color: stats.netProfit >= 0 ? '#4caf50' : '#f44336' }}>{formatM(stats.netProfit)}</div><div>Net Profit</div></div>
                            <div className="stat-card"><div className="stat-icon">👥</div><div className="stat-value">{stats.totalCustomers}</div><div>Total Customers</div></div>
                        </div>

                        <div className="charts-grid">
                            <div className="chart-card">
                                <h3>📈 Monthly Revenue Trend (12 Months)</h3>
                                <ResponsiveContainer width="100%" height={300}>
                                    <LineChart data={chartData.monthlyRevenue}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                                        <XAxis dataKey="month" stroke="#ff6a00" />
                                        <YAxis stroke="#ff6a00" />
                                        <Tooltip contentStyle={{ backgroundColor: '#1a0a00', borderColor: '#ff6a00' }} formatter={(value) => formatM(value)} />
                                        <Legend />
                                        <Line type="monotone" dataKey="revenue" name="Revenue (M)" stroke="#ff6a00" strokeWidth={3} dot={{ fill: '#ff6a00', r: 5 }} />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>

                            <div className="chart-card">
                                <h3>🥧 Running Expenses Breakdown</h3>
                                <ResponsiveContainer width="100%" height={300}>
                                    <PieChart>
                                        <Pie data={pieData} cx="50%" cy="50%" labelLine={true} label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`} outerRadius={100} dataKey="value">
                                            {pieData.map((entry, index) => (<Cell key={`cell-${index}`} fill={entry.color} />))}
                                        </Pie>
                                        <Tooltip contentStyle={{ backgroundColor: '#1a0a00', borderColor: '#ff6a00' }} formatter={(value) => formatM(value)} />
                                        <Legend />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>

                            <div className="chart-card">
                                <h3>📊 Running Expenses Comparison</h3>
                                <ResponsiveContainer width="100%" height={300}>
                                    <BarChart data={barData}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                                        <XAxis dataKey="name" stroke="#ff6a00" />
                                        <YAxis stroke="#ff6a00" />
                                        <Tooltip contentStyle={{ backgroundColor: '#1a0a00', borderColor: '#ff6a00' }} formatter={(value) => formatM(value)} />
                                        <Bar dataKey="amount" name="Amount (M)" fill="#ff6a00" radius={[8, 8, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'approvals' && (
                    <div>
                        <h2>Pending Employee Approvals</h2>
                        {pendingEmployees.length === 0 ? <p>No pending approvals</p> : (
                            <table className="data-table">
                                <thead><tr><th>Name</th><th>Username</th><th>Registered</th><th>Actions</th></tr></thead>
                                <tbody>{pendingEmployees.map(emp => (
                                    <tr key={emp.user_id}>
                                        <td>{emp.full_name}</td>
                                        <td>{emp.username}</td>
                                        <td>{new Date(emp.created_at).toLocaleDateString()}</td>
                                        <td><button className="btn-success" onClick={() => approveEmployee(emp.user_id)}>Approve</button><button className="btn-danger" style={{ marginLeft: '10px' }} onClick={() => rejectEmployee(emp.user_id)}>Reject</button></td>
                                    </tr>
                                ))}</tbody>
                            </table>
                        )}
                    </div>
                )}

                {activeTab === 'employees' && (
                    <div>
                        <h2>Employees & Salary Management</h2>
                        <table className="data-table">
                            <thead><tr><th>Name</th><th>Position</th><th>Salary (M)</th><th>Action</th></tr></thead>
                            <tbody>{employees.map(emp => (
                                <tr key={emp.employee_id}>
                                    <td>{emp.full_name}</td>
                                    <td>{emp.position || 'Barber'}</td>
                                    <td>{formatM(emp.salary)}</td>
                                    <td><button className="btn-orange" onClick={() => { setSelectedEmployee(emp.employee_id); setSalaryAmount(emp.salary || 0); setShowSalaryModal(true); }}>Pay Salary</button></td>
                                </tr>
                            ))}</tbody>
                        </table>
                    </div>
                )}

                {activeTab === 'income' && (
                    <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h2>All Income</h2>
                            <button className="btn-success" onClick={() => setShowIncomeModal(true)} style={{ padding: '10px 20px' }}>➕ Log New Income</button>
                        </div>
                        <div className="stats-grid" style={{ gridTemplateColumns: '1fr' }}>
                            <div className="stat-card"><div className="stat-icon">💰</div><div className="stat-value">{formatM(totalIncome)}</div><div>Running Total Income</div></div>
                        </div>
                        <table className="data-table">
                            <thead><tr><th>Source</th><th>Type</th><th>Appt. ID</th><th>Amount (M)</th><th>Running Total (M)</th><th>Method</th><th>Date</th></tr></thead>
                            <tbody>{incomeWithRunningTotal.map((p, idx) => (
                                <tr key={`${p.id}-${idx}`}>
                                    <td>{p.source}</td>
                                    <td><span style={{ background: p.source_type === 'Customer Payment' ? '#28a745' : '#17a2b8', color: 'white', padding: '3px 8px', borderRadius: '12px', fontSize: '12px' }}>{p.source_type}</span></td>
                                    <td>{p.appointment_id || '—'}</td>
                                    <td>{formatM(p.amount)}</td>
                                    <td>{formatM(p.runningTotal)}</td>
                                    <td>{p.payment_method}</td>
                                    <td>{new Date(p.income_date).toLocaleDateString()}</td>
                                </tr>
                            ))}</tbody>
                        </table>
                    </div>
                )}

                {activeTab === 'complaints' && (
                    <div>
                        <h2>Complaints</h2>
                        <table className="data-table">
                            <thead><tr><th>Sender</th><th>Role</th><th>Subject</th><th>Status</th><th>Date</th></tr></thead>
                            <tbody>{complaints.map(c => (
                                <tr key={c.complaint_id} onClick={() => setSelectedComplaint(c)} style={{ cursor: 'pointer' }}>
                                    <td>{c.sender_name}</td>
                                    <td>{c.sender_role}</td>
                                    <td>{c.subject}</td>
                                    <td style={{ color: c.status === 'REPLIED' ? '#4caf50' : '#ff9800' }}>{c.status || (c.reply ? 'REPLIED' : 'PENDING')}</td>
                                    <td>{new Date(c.created_at).toLocaleDateString()}</td>
                                </tr>
                            ))}</tbody>
                        </table>
                    </div>
                )}
            </div>

            {showSalaryModal && (
                <div className="modal"><div className="modal-content"><h3>Pay Salary</h3><input type="number" className="input-field" placeholder="Amount (M)" value={salaryAmount} onChange={(e) => setSalaryAmount(e.target.value)} /><button className="btn-orange" onClick={paySalary}>Confirm Payment</button><button className="btn-danger" onClick={() => setShowSalaryModal(false)}>Cancel</button></div></div>
            )}

            {showExpenseModal && (
                <div className="modal">
                    <div className="modal-content">
                        <h3>Log New Expense</h3>
                        <select className="input-field" value={expenseData.category} onChange={(e) => setExpenseData({ ...expenseData, category: e.target.value })}>
                            <option value="Equipment">Equipment</option>
                            <option value="Salary">Salary</option>
                            <option value="Other">Other</option>
                        </select>
                        <input type="number" className="input-field" placeholder="Amount (M)" value={expenseData.amount} onChange={(e) => setExpenseData({ ...expenseData, amount: e.target.value })} />
                        <input type="text" className="input-field" placeholder="Description" value={expenseData.description} onChange={(e) => setExpenseData({ ...expenseData, description: e.target.value })} />
                        <button className="btn-orange" onClick={submitExpense}>Save Expense</button>
                        <button className="btn-danger" onClick={() => setShowExpenseModal(false)}>Cancel</button>
                    </div>
                </div>
            )}

            {showIncomeModal && (
                <div className="modal">
                    <div className="modal-content">
                        <h3>Log New Income</h3>
                        <input type="text" className="input-field" placeholder="Source (e.g. Rental, Sponsorship)" value={incomeData.source} onChange={(e) => setIncomeData({ ...incomeData, source: e.target.value })} />
                        <select className="input-field" value={incomeData.category} onChange={(e) => setIncomeData({ ...incomeData, category: e.target.value })}>
                            <option value="Other">Other</option>
                            <option value="Rental">Rental</option>
                            <option value="Sponsorship">Sponsorship</option>
                            <option value="Merchandise">Merchandise</option>
                            <option value="Services">Services</option>
                        </select>
                        <select className="input-field" value={incomeData.payment_method} onChange={(e) => setIncomeData({ ...incomeData, payment_method: e.target.value })}>
                            <option value="CASH">Cash</option>
                            <option value="CARD">Card</option>
                            <option value="MOBILE">Mobile Money</option>
                        </select>
                        <input type="number" className="input-field" placeholder="Amount (M)" value={incomeData.amount} onChange={(e) => setIncomeData({ ...incomeData, amount: e.target.value })} />
                        <input type="text" className="input-field" placeholder="Description (optional)" value={incomeData.description} onChange={(e) => setIncomeData({ ...incomeData, description: e.target.value })} />
                        <button className="btn-success" onClick={submitIncome}>Save Income</button>
                        <button className="btn-danger" onClick={() => setShowIncomeModal(false)}>Cancel</button>
                    </div>
                </div>
            )}

            {selectedComplaint && (
                <div className="modal">
                    <div className="modal-content">
                        <h3>Complaint Details</h3>
                        <p><strong>From:</strong> {selectedComplaint.sender_name} ({selectedComplaint.sender_role})</p>
                        <p><strong>Date:</strong> {new Date(selectedComplaint.created_at).toLocaleString()}</p>
                        <p><strong>Subject:</strong> {selectedComplaint.subject}</p>
                        <div style={{ backgroundColor: '#222', padding: '15px', borderRadius: '8px', margin: '15px 0' }}>
                            <p>{selectedComplaint.message}</p>
                        </div>
                        {selectedComplaint.reply ? (
                            <div className="reply-box"><strong>Your Reply:</strong> {selectedComplaint.reply}</div>
                        ) : (
                            <div>
                                <textarea className="input-field" placeholder="Write reply..." rows="4" value={replyText[selectedComplaint.complaint_id] || ''} onChange={(e) => setReplyText({ ...replyText, [selectedComplaint.complaint_id]: e.target.value })} />
                                <button className="btn-orange" onClick={() => replyComplaint(selectedComplaint.complaint_id)}>Send Reply</button>
                            </div>
                        )}
                        <button className="btn-danger" onClick={() => setSelectedComplaint(null)} style={{ marginTop: '10px' }}>Close</button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default OwnerDashboard;