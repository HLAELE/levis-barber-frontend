import React, { useState, useEffect } from 'react';
import axios from 'axios';
import logoImage from '../../assets/levis-logo.svg';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

function EmployeeDashboard({ user, onLogout }) {
    const [appointments, setAppointments] = useState([]);
    const [salary, setSalary] = useState(0);
    const [complaints, setComplaints] = useState([]);
    const [complaintSubject, setComplaintSubject] = useState('');
    const [complaintMessage, setComplaintMessage] = useState('');
    const [activeTab, setActiveTab] = useState('appointments');
    const [rescheduleData, setRescheduleData] = useState({ id: null, date: '', time: '' });
    const [loading, setLoading] = useState(true);

    const token = localStorage.getItem('token');
    const employeeId = user?.userId;

    const fetchData = async () => {
        if (!token || !employeeId) { setLoading(false); return; }
        try {
            const [apptsRes, salaryRes, complaintsRes] = await Promise.all([
                axios.get(`${API_URL}/employee/appointments/${employeeId}`, { headers: { Authorization: `Bearer ${token}` } }),
                axios.get(`${API_URL}/employee/salary/${employeeId}`, { headers: { Authorization: `Bearer ${token}` } }),
                axios.get(`${API_URL}/employee/my-complaints`, { headers: { Authorization: `Bearer ${token}` } })
            ]);
            setAppointments(apptsRes.data || []);
            setSalary(salaryRes.data?.salary || 0);
            setComplaints(complaintsRes.data || []);
        } catch (error) { console.error(error); }
        setLoading(false);
    };

    const updateStatus = async (id, status) => {
        try {
            await axios.put(`${API_URL}/employee/appointments/${id}/status`, { status }, { headers: { Authorization: `Bearer ${token}` } });
            fetchData();
            alert(`Appointment ${status.toLowerCase()}!`);
        } catch (error) { console.error(error); }
    };

    const rescheduleAppointment = async () => {
        if (!rescheduleData.id || !rescheduleData.date || !rescheduleData.time) return;
        try {
            await axios.put(`${API_URL}/employee/appointments/${rescheduleData.id}/reschedule`, { appointment_date: rescheduleData.date, appointment_time: rescheduleData.time }, { headers: { Authorization: `Bearer ${token}` } });
            setRescheduleData({ id: null, date: '', time: '' });
            fetchData();
            alert('Appointment rescheduled!');
        } catch (error) { console.error(error); }
    };

    const downloadSalary = async () => {
        try {
            const response = await axios.get(`${API_URL}/employee/download-salary/${employeeId}`, { headers: { Authorization: `Bearer ${token}` }, responseType: 'blob' });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `salary_slip_${employeeId}.csv`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            alert('Salary slip downloaded!');
        } catch (error) { console.error(error); }
    };

    const sendComplaint = async () => {
        if (!complaintSubject || !complaintMessage) { alert('Please enter subject and message'); return; }
        try {
            await axios.post(`${API_URL}/employee/complaint`, { subject: complaintSubject, message: complaintMessage }, { headers: { Authorization: `Bearer ${token}` } });
            setComplaintSubject('');
            setComplaintMessage('');
            fetchData();
            alert('Complaint sent!');
        } catch (error) { console.error(error); }
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => { fetchData(); }, []);

    if (loading) return <div className="dashboard-container"><div className="sidebar"><div className="sidebar-logo"><img src={logoImage} alt="Levis Barber Logo" /></div></div><div className="main-content"><h2>Loading...</h2></div></div>;

    const totalIncome = appointments.filter(a => a.payment_status === 'PAID').reduce((sum, a) => sum + (parseFloat(a.amount) || 0), 0);

    return (
        <div className="dashboard-container">
            <div className="sidebar">
                <div className="sidebar-logo"><img src={logoImage} alt="Levis Barber Logo" /></div>
                <div className="sidebar-nav">
                    <button className={`nav-btn ${activeTab === 'appointments' ? 'active' : ''}`} onClick={() => setActiveTab('appointments')}>📅 Appointments</button>
                    <button className={`nav-btn ${activeTab === 'payments' ? 'active' : ''}`} onClick={() => setActiveTab('payments')}>💰 Payments</button>
                    <button className={`nav-btn ${activeTab === 'salary' ? 'active' : ''}`} onClick={() => setActiveTab('salary')}>💵 My Salary</button>
                    <button className={`nav-btn ${activeTab === 'complaints' ? 'active' : ''}`} onClick={() => setActiveTab('complaints')}>📝 Complaints</button>
                </div>
                <div className="sidebar-footer"><div>✂️ {user?.full_name}</div><button className="logout-btn" onClick={onLogout}>Logout</button></div>
            </div>
            <div className="main-content">
                {activeTab === 'appointments' && (
                    <div>
                        <h2>My Appointments</h2>
                        <button className="btn-orange" onClick={fetchData} style={{ width: 'auto', padding: '8px 16px', marginBottom: '20px' }}>🔄 Refresh</button>
                        {appointments.length === 0 ? <p>No appointments yet.</p> : (
                            <table className="data-table"><thead><tr><th>Customer</th><th>Service</th><th>Date</th><th>Time</th><th>Status</th><th>Payment</th><th>Actions</th></tr></thead>
                            <tbody>{appointments.map(a => (<tr key={a.appointment_id}><td>{a.customer_name}</td><td>{a.service_description || a.custom_service}</td><td>{a.appointment_date}</td><td>{a.appointment_time}</td><td><span className={`status-${(a.status || 'PENDING').toLowerCase()}`}>{a.status || 'PENDING'}</span></td><td><span className={a.payment_status === 'PAID' ? 'paid' : 'unpaid'}>{a.payment_status || 'UNPAID'}</span></td><td>{(a.status !== 'COMPLETED' && a.status !== 'CANCELLED') && (<><button className="btn-success" onClick={() => updateStatus(a.appointment_id, 'COMPLETED')}>Complete</button><button className="btn-danger" onClick={() => updateStatus(a.appointment_id, 'CANCELLED')}>Decline</button></>)}<button className="btn-orange" onClick={() => setRescheduleData({ id: a.appointment_id, date: a.appointment_date, time: a.appointment_time })}>Reschedule</button></td></tr>))}</tbody></table>)}
                        {rescheduleData.id && (<div className="modal"><div className="modal-content"><h3>Reschedule</h3><input type="date" value={rescheduleData.date} onChange={(e) => setRescheduleData({ ...rescheduleData, date: e.target.value })} /><input type="time" value={rescheduleData.time} onChange={(e) => setRescheduleData({ ...rescheduleData, time: e.target.value })} /><button className="btn-orange" onClick={rescheduleAppointment}>Confirm</button><button className="btn-danger" onClick={() => setRescheduleData({ id: null, date: '', time: '' })}>Cancel</button></div></div>)}
                    </div>
                )}
                {activeTab === 'payments' && (
                    <div>
                        <h2>Customer Payments</h2>
                        <div className="stats-grid"><div className="stat-card"><div className="stat-icon">💰</div><div className="stat-value">M {totalIncome.toLocaleString()}</div><div>Total Received</div></div></div>
                        <table className="data-table"><thead><tr><th>Customer</th><th>Amount</th><th>Method</th><th>Date</th></tr></thead>
                        <tbody>{appointments.filter(a => a.payment_status === 'PAID').map(a => (<tr key={a.appointment_id}><td>{a.customer_name}</td><td>M {parseFloat(a.amount).toLocaleString()}</td><td>{a.payment_method || 'CASH'}</td><td>{a.appointment_date}</td></tr>))}</tbody></table>
                    </div>
                )}
                {activeTab === 'salary' && (
                    <div>
                        <h2>My Salary</h2>
                        <div className="stats-grid"><div className="stat-card"><div className="stat-icon">💰</div><div className="stat-value">M {salary.toLocaleString()}</div><div>Current Monthly Salary</div></div></div>
                        <button className="btn-orange" onClick={downloadSalary}>📥 Download Salary Slip</button>
                    </div>
                )}
                {activeTab === 'complaints' && (
                    <div>
                        <h2>Send Complaint to Owner</h2>
                        <input className="input-field" placeholder="Subject" value={complaintSubject} onChange={(e) => setComplaintSubject(e.target.value)} />
                        <textarea className="input-field" placeholder="Message" rows="4" value={complaintMessage} onChange={(e) => setComplaintMessage(e.target.value)} />
                        <button className="btn-orange" onClick={sendComplaint}>Send Complaint</button>
                        <h2>My Complaints & Replies</h2>
                        {complaints.map(c => (<div key={c.complaint_id} className="complaint-card"><strong>{c.subject}</strong><p>{c.message}</p>{c.reply && <div className="reply-box"><strong>Owner Reply:</strong> {c.reply}</div>}</div>))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default EmployeeDashboard;