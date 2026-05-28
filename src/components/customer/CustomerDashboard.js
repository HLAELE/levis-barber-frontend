import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

function CustomerDashboard({ user, onLogout }) {
    const [myAppointments, setMyAppointments] = useState([]);
    const [complaints, setComplaints] = useState([]);
    const [complaintSubject, setComplaintSubject] = useState('');
    const [complaintMessage, setComplaintMessage] = useState('');
    const [activeTab, setActiveTab] = useState('book');
    const [booking, setBooking] = useState({ custom_service: '', appointment_date: '', appointment_time: '', payment_method: 'CASH', amount: '' });

    const token = localStorage.getItem('token');

    const fetchData = async () => {
        try {
            const [apptsRes, complaintsRes] = await Promise.all([
                axios.get(`${API_URL}/customer/my-appointments/${user?.userId}`, { headers: { Authorization: `Bearer ${token}` } }),
                axios.get(`${API_URL}/customer/my-complaints/${user?.userId}`, { headers: { Authorization: `Bearer ${token}` } })
            ]);
            setMyAppointments(apptsRes.data || []);
            setComplaints(complaintsRes.data || []);
        } catch (error) { 
            console.error('Fetch error:', error); 
        }
    };

    const bookAppointment = async () => {
        if (!booking.custom_service || !booking.appointment_date || !booking.appointment_time || !booking.amount) {
            alert('Please fill all fields');
            return;
        }
        try {
            await axios.post(`${API_URL}/customer/appointments`, booking, { headers: { Authorization: `Bearer ${token}` } });
            setBooking({ custom_service: '', appointment_date: '', appointment_time: '', payment_method: 'CASH', amount: '' });
            await fetchData();
            alert('Appointment booked! A barber will be assigned.');
        } catch (error) { 
            console.error(error); 
            alert('Failed to book appointment'); 
        }
    };

    const downloadReceipt = async (appointmentId) => {
        try {
            const response = await axios.get(`${API_URL}/customer/download-receipt/${appointmentId}`, {
                headers: { Authorization: `Bearer ${token}` },
                responseType: 'blob'
            });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `booking_receipt_${appointmentId}.csv`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            alert('Receipt downloaded!');
        } catch (error) { 
            console.error(error); 
            alert('Failed to download receipt'); 
        }
    };

    const sendComplaint = async () => {
        if (!complaintSubject || !complaintMessage) {
            alert('Please enter subject and message');
            return;
        }
        try {
            await axios.post(`${API_URL}/customer/complaint`, { subject: complaintSubject, message: complaintMessage }, { headers: { Authorization: `Bearer ${token}` } });
            setComplaintSubject('');
            setComplaintMessage('');
            await fetchData();
            alert('Complaint sent!');
        } catch (error) { 
            console.error(error); 
            alert('Failed to send complaint'); 
        }
    };

    useEffect(() => { 
        fetchData(); 
    }, []);

    return (
        <div className="dashboard-container">
            <div className="sidebar">
                <div className="sidebar-logo">💈 LEVIS.BARBER</div>
                <div className="sidebar-nav">
                    <button className={`nav-btn ${activeTab === 'book' ? 'active' : ''}`} onClick={() => setActiveTab('book')}>📅 Book Appointment</button>
                    <button className={`nav-btn ${activeTab === 'appointments' ? 'active' : ''}`} onClick={() => setActiveTab('appointments')}>📋 My Appointments</button>
                    <button className={`nav-btn ${activeTab === 'complaints' ? 'active' : ''}`} onClick={() => setActiveTab('complaints')}>📝 Complaints</button>
                </div>
                <div className="sidebar-footer">
                    <div>👤 {user?.full_name}</div>
                    <button className="logout-btn" onClick={onLogout}>Logout</button>
                </div>
            </div>
            <div className="main-content">
                {activeTab === 'book' && (
                    <div>
                        <h2>Book Appointment</h2>
                        <textarea className="input-field" placeholder="Describe your hair service (e.g., low fade with line-up and beard trim)" rows="3" value={booking.custom_service} onChange={(e) => setBooking({ ...booking, custom_service: e.target.value })} />
                        <input type="date" className="input-field" value={booking.appointment_date} onChange={(e) => setBooking({ ...booking, appointment_date: e.target.value })} />
                        <input type="time" className="input-field" value={booking.appointment_time} onChange={(e) => setBooking({ ...booking, appointment_time: e.target.value })} />
                        <select className="input-field" value={booking.payment_method} onChange={(e) => setBooking({ ...booking, payment_method: e.target.value })}>
                            <option>CASH</option>
                            <option>CARD</option>
                            <option>MOBILE</option>
                        </select>
                        <input type="number" className="input-field" placeholder="Amount (M)" value={booking.amount} onChange={(e) => setBooking({ ...booking, amount: e.target.value })} />
                        <button className="btn-orange" onClick={bookAppointment}>Book Appointment</button>
                    </div>
                )}
                {activeTab === 'appointments' && (
                    <div>
                        <h2>My Appointments</h2>
                        <button className="btn-orange" onClick={fetchData} style={{ width: 'auto', padding: '8px 16px', marginBottom: '20px' }}>🔄 Refresh</button>
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Service</th>
                                    <th>Barber</th>
                                    <th>Date</th>
                                    <th>Time</th>
                                    <th>Status</th>
                                    <th>Payment</th>
                                    <th>Receipt</th>
                                </tr>
                            </thead>
                            <tbody>
                                {myAppointments.map((a) => (
                                    <tr key={a.appointment_id}>
                                        <td>{a.service_description || a.custom_service}</td>
                                        <td>{a.barber_name || 'Pending Assignment'}</td>
                                        <td>{a.appointment_date}</td>
                                        <td>{a.appointment_time}</td>
                                        <td><span className={`status-${(a.status || 'PENDING').toLowerCase()}`}>{a.status || 'PENDING'}</span></td>
                                        <td><span className={a.payment_status === 'PAID' ? 'paid' : 'unpaid'}>{a.payment_status || 'UNPAID'}</span></td>
                                        <td><button className="btn-success" onClick={() => downloadReceipt(a.appointment_id)}>📥 CSV</button></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
                {activeTab === 'complaints' && (
                    <div>
                        <h2>Send Complaint to Owner</h2>
                        <input className="input-field" placeholder="Subject" value={complaintSubject} onChange={(e) => setComplaintSubject(e.target.value)} />
                        <textarea className="input-field" placeholder="Message" rows="4" value={complaintMessage} onChange={(e) => setComplaintMessage(e.target.value)} />
                        <button className="btn-orange" onClick={sendComplaint}>Send Complaint</button>
                        <h2>My Complaints & Replies</h2>
                        {complaints.map((c) => (
                            <div key={c.complaint_id} className="complaint-card">
                                <strong>{c.subject}</strong>
                                <p>{c.message}</p>
                                {c.reply && <div className="reply-box"><strong>Owner Reply:</strong> {c.reply}</div>}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default CustomerDashboard;