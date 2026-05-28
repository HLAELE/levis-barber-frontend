import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

function EmployeeDashboard({ user, onLogout }) {
    const [appointments, setAppointments] = useState([]);
    const [salary, setSalary] = useState(0);
    const [complaints, setComplaints] = useState([]);
    const [complaintSubject, setComplaintSubject] = useState('');
    const [complaintMessage, setComplaintMessage] = useState('');
    const [activeTab, setActiveTab] = useState('appointments');
    const [loading, setLoading] = useState(true);

    const token = localStorage.getItem('token');
    const employeeId = user?.userId;

    const fetchData = async () => {
        if (!token || !employeeId) {
            setLoading(false);
            return;
        }
        try {
            const apptsRes = await axios.get(`${API_URL}/employee/appointments/${employeeId}`, { headers: { Authorization: `Bearer ${token}` } });
            const salaryRes = await axios.get(`${API_URL}/employee/salary/${employeeId}`, { headers: { Authorization: `Bearer ${token}` } });
            const complaintsRes = await axios.get(`${API_URL}/employee/my-complaints`, { headers: { Authorization: `Bearer ${token}` } });
            
            setAppointments(apptsRes.data || []);
            setSalary(salaryRes.data?.salary || 0);
            setComplaints(complaintsRes.data || []);
        } catch (error) {
            console.error(error);
        }
        setLoading(false);
    };

    const updateStatus = async (id, status) => {
        try {
            await axios.put(`${API_URL}/employee/appointments/${id}/status`, { status }, { headers: { Authorization: `Bearer ${token}` } });
            fetchData();
            alert(`Appointment ${status.toLowerCase()}!`);
        } catch (error) {
            console.error(error);
        }
    };

    const downloadSalary = async () => {
        try {
            const response = await axios.get(`${API_URL}/employee/download-salary/${employeeId}`, {
                headers: { Authorization: `Bearer ${token}` },
                responseType: 'blob'
            });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `salary_slip_${employeeId}.csv`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            alert('Salary slip downloaded!');
        } catch (error) {
            console.error(error);
            alert('Failed to download salary slip');
        }
    };

    const sendComplaint = async () => {
        if (!complaintSubject || !complaintMessage) {
            alert('Please enter subject and message');
            return;
        }
        try {
            await axios.post(`${API_URL}/employee/complaint`, { subject: complaintSubject, message: complaintMessage }, { headers: { Authorization: `Bearer ${token}` } });
            setComplaintSubject('');
            setComplaintMessage('');
            fetchData();
            alert('Complaint sent!');
        } catch (error) {
            console.error(error);
            alert('Failed to send complaint');
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    if (loading) {
        return <div style={{ padding: '20px', color: 'white', textAlign: 'center' }}>Loading Employee Dashboard...</div>;
    }

    const totalIncome = appointments.filter(a => a.payment_status === 'PAID').reduce((sum, a) => sum + (parseFloat(a.amount) || 0), 0);

    return (
        <div className="dashboard-container">
            <div className="sidebar">
                <div className="sidebar-logo">✂️ LEVIS.BARBER</div>
                <div className="sidebar-nav">
                    <button className={`nav-btn ${activeTab === 'appointments' ? 'active' : ''}`} onClick={() => setActiveTab('appointments')}>📅 Appointments</button>
                    <button className={`nav-btn ${activeTab === 'payments' ? 'active' : ''}`} onClick={() => setActiveTab('payments')}>💰 Payments</button>
                    <button className={`nav-btn ${activeTab === 'salary' ? 'active' : ''}`} onClick={() => setActiveTab('salary')}>💵 My Salary</button>
                    <button className={`nav-btn ${activeTab === 'complaints' ? 'active' : ''}`} onClick={() => setActiveTab('complaints')}>📝 Complaints</button>
                </div>
                <div className="sidebar-footer">
                    <div>✂️ {user?.full_name}</div>
                    <button className="logout-btn" onClick={onLogout}>Logout</button>
                </div>
            </div>

            <div className="main-content">
                {activeTab === 'appointments' && (
                    <div>
                        <h2>My Appointments</h2>
                        <button className="btn-orange" onClick={fetchData} style={{ marginBottom: '20px' }}>🔄 Refresh</button>
                        {appointments.length === 0 && <p>No appointments yet. Customer bookings will appear here.</p>}
                        {appointments.length > 0 && (
                            <table className="data-table">
                                <thead>
                                    <tr>
                                        <th>Customer</th>
                                        <th>Service</th>
                                        <th>Date</th>
                                        <th>Time</th>
                                        <th>Status</th>
                                        <th>Payment</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {appointments.map((a) => (
                                        <tr key={a.appointment_id}>
                                            <td>{a.customer_name || 'Unknown'}</td>
                                            <td>{a.custom_service || 'No description'}</td>
                                            <td>{a.appointment_date || 'N/A'}</td>
                                            <td>{a.appointment_time || 'N/A'}</td>
                                            <td>
                                                <span className={`status-${(a.status || 'PENDING').toLowerCase()}`}>
                                                    {a.status || 'PENDING'}
                                                </span>
                                            </td>
                                            <td>
                                                <span className={a.payment_status === 'PAID' ? 'paid' : 'unpaid'}>
                                                    {a.payment_status || 'UNPAID'}
                                                </span>
                                            </td>
                                            <td>
                                                {(a.status !== 'COMPLETED' && a.status !== 'CANCELLED') && (
                                                    <div style={{ display: 'flex', gap: '5px' }}>
                                                        <button className="btn-success" onClick={() => updateStatus(a.appointment_id, 'COMPLETED')}>Complete</button>
                                                        <button className="btn-danger" onClick={() => updateStatus(a.appointment_id, 'CANCELLED')}>Decline</button>
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                )}

                {activeTab === 'payments' && (
                    <div>
                        <h2>Customer Payments</h2>
                        <div className="stats-grid" style={{ gridTemplateColumns: '1fr' }}>
                            <div className="stat-card">
                                <div className="stat-icon">💰</div>
                                <div className="stat-value">M {totalIncome.toLocaleString()}</div>
                                <div>Total Income Received</div>
                            </div>
                        </div>
                        {appointments.filter(a => a.payment_status === 'PAID').length === 0 && <p>No payments received yet.</p>}
                        {appointments.filter(a => a.payment_status === 'PAID').length > 0 && (
                            <table className="data-table">
                                <thead>
                                    <tr>
                                        <th>Customer</th>
                                        <th>Amount (M)</th>
                                        <th>Method</th>
                                        <th>Date</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {appointments.filter(a => a.payment_status === 'PAID').map((a) => (
                                        <tr key={a.appointment_id}>
                                            <td>{a.customer_name}</td>
                                            <td>M {parseFloat(a.amount).toLocaleString()}</td>
                                            <td>{a.payment_method || 'CASH'}</td>
                                            <td>{a.appointment_date}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                )}

                {activeTab === 'salary' && (
                    <div>
                        <h2>My Salary</h2>
                        <div className="stats-grid" style={{ gridTemplateColumns: '1fr' }}>
                            <div className="stat-card">
                                <div className="stat-icon">💵</div>
                                <div className="stat-value">M {parseFloat(salary).toLocaleString()}</div>
                                <div>Current Monthly Salary</div>
                            </div>
                        </div>
                        <button className="btn-orange" onClick={downloadSalary}>📥 Download Salary Statement (CSV)</button>
                    </div>
                )}

                {activeTab === 'complaints' && (
                    <div>
                        <h2>Send Complaint to Owner</h2>
                        <input className="input-field" placeholder="Subject" value={complaintSubject} onChange={(e) => setComplaintSubject(e.target.value)} />
                        <textarea className="input-field" placeholder="Message" rows="4" value={complaintMessage} onChange={(e) => setComplaintMessage(e.target.value)} />
                        <button className="btn-orange" onClick={sendComplaint}>Send Complaint</button>
                        <h2 style={{ marginTop: '30px' }}>My Complaints & Replies</h2>
                        {complaints.length === 0 && <p>No complaints sent.</p>}
                        {complaints.map((c) => (
                            <div key={c.complaint_id} className="complaint-card">
                                <strong>{c.subject}</strong>
                                <p>{c.message}</p>
                                {c.reply && (
                                    <div className="reply-box">
                                        <strong>Owner Reply:</strong> {c.reply}
                                    </div>
                                )}
                                {!c.reply && <p style={{ color: '#ff9800', marginTop: '10px' }}>Awaiting owner reply...</p>}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default EmployeeDashboard;