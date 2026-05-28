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
        return React.createElement('div', { style: { padding: '20px', color: 'white', textAlign: 'center' } }, 'Loading Employee Dashboard...');
    }

    const totalIncome = appointments.filter(a => a.payment_status === 'PAID').reduce((sum, a) => sum + (parseFloat(a.amount) || 0), 0);

    // Helper function to create appointment table
    const renderAppointmentsTab = () => {
        if (appointments.length === 0) {
            return React.createElement('p', null, 'No appointments yet. Customer bookings will appear here.');
        }
        
        const rows = appointments.map(a => 
            React.createElement('tr', { key: a.appointment_id },
                React.createElement('td', null, a.customer_name || 'Unknown'),
                React.createElement('td', null, a.custom_service || 'No description'),
                React.createElement('td', null, a.appointment_date || 'N/A'),
                React.createElement('td', null, a.appointment_time || 'N/A'),
                React.createElement('td', null, React.createElement('span', { className: `status-${(a.status || 'PENDING').toLowerCase()}` }, a.status || 'PENDING')),
                React.createElement('td', null, React.createElement('span', { className: a.payment_status === 'PAID' ? 'paid' : 'unpaid' }, a.payment_status || 'UNPAID')),
                React.createElement('td', null, 
                    (a.status !== 'COMPLETED' && a.status !== 'CANCELLED') ? 
                        React.createElement('div', { style: { display: 'flex', gap: '5px' } },
                            React.createElement('button', { className: 'btn-success', onClick: () => updateStatus(a.appointment_id, 'COMPLETED') }, 'Complete'),
                            React.createElement('button', { className: 'btn-danger', onClick: () => updateStatus(a.appointment_id, 'CANCELLED') }, 'Decline')
                        ) : null
                )
            )
        );
        
        return React.createElement('div', { style: { overflowX: 'auto' } },
            React.createElement('table', { className: 'data-table' },
                React.createElement('thead', null,
                    React.createElement('tr', null,
                        React.createElement('th', null, 'Customer'),
                        React.createElement('th', null, 'Service'),
                        React.createElement('th', null, 'Date'),
                        React.createElement('th', null, 'Time'),
                        React.createElement('th', null, 'Status'),
                        React.createElement('th', null, 'Payment'),
                        React.createElement('th', null, 'Actions')
                    )
                ),
                React.createElement('tbody', null, rows)
            )
        );
    };

    const renderPaymentsTab = () => {
        const paidAppointments = appointments.filter(a => a.payment_status === 'PAID');
        if (paidAppointments.length === 0) {
            return React.createElement('p', null, 'No payments received yet.');
        }
        
        const rows = paidAppointments.map(a => 
            React.createElement('tr', { key: a.appointment_id },
                React.createElement('td', null, a.customer_name),
                React.createElement('td', null, `M ${parseFloat(a.amount).toLocaleString()}`),
                React.createElement('td', null, a.payment_method || 'CASH'),
                React.createElement('td', null, a.appointment_date)
            )
        );
        
        return React.createElement('table', { className: 'data-table' },
            React.createElement('thead', null,
                React.createElement('tr', null,
                    React.createElement('th', null, 'Customer'),
                    React.createElement('th', null, 'Amount (M)'),
                    React.createElement('th', null, 'Method'),
                    React.createElement('th', null, 'Date')
                )
            ),
            React.createElement('tbody', null, rows)
        );
    };

    const renderSalaryTab = () => {
        return React.createElement('div', null,
            React.createElement('div', { className: 'stats-grid', style: { gridTemplateColumns: '1fr' } },
                React.createElement('div', { className: 'stat-card' },
                    React.createElement('div', { className: 'stat-icon' }, '💰'),
                    React.createElement('div', { className: 'stat-value' }, `M ${parseFloat(salary).toLocaleString()}`),
                    React.createElement('div', null, 'Current Monthly Salary')
                )
            ),
            React.createElement('button', { className: 'btn-orange', onClick: downloadSalary }, '📥 Download Salary Statement (CSV)')
        );
    };

    const renderComplaintsTab = () => {
        const complaintItems = complaints.map(c => 
            React.createElement('div', { key: c.complaint_id, className: 'complaint-card' },
                React.createElement('strong', null, c.subject),
                React.createElement('p', null, c.message),
                c.reply ? React.createElement('div', { className: 'reply-box' }, React.createElement('strong', null, 'Owner Reply: '), c.reply) : null
            )
        );
        
        return React.createElement('div', null,
            React.createElement('input', { className: 'input-field', placeholder: 'Subject', value: complaintSubject, onChange: (e) => setComplaintSubject(e.target.value) }),
            React.createElement('textarea', { className: 'input-field', placeholder: 'Message', rows: '4', value: complaintMessage, onChange: (e) => setComplaintMessage(e.target.value) }),
            React.createElement('button', { className: 'btn-orange', onClick: sendComplaint }, 'Send Complaint'),
            React.createElement('h2', { style: { marginTop: '30px' } }, 'My Complaints & Replies'),
            complaintItems.length === 0 ? React.createElement('p', null, 'No complaints sent.') : complaintItems
        );
    };

    const renderContent = () => {
        if (activeTab === 'appointments') {
            return React.createElement('div', null,
                React.createElement('h2', null, 'My Appointments'),
                React.createElement('button', { className: 'btn-orange', onClick: fetchData, style: { marginBottom: '20px' } }, '🔄 Refresh'),
                renderAppointmentsTab()
            );
        }
        if (activeTab === 'payments') {
            return React.createElement('div', null,
                React.createElement('h2', null, 'Customer Payments'),
                React.createElement('div', { className: 'stats-grid', style: { gridTemplateColumns: '1fr' } },
                    React.createElement('div', { className: 'stat-card' },
                        React.createElement('div', { className: 'stat-icon' }, '💰'),
                        React.createElement('div', { className: 'stat-value' }, `M ${totalIncome.toLocaleString()}`),
                        React.createElement('div', null, 'Total Income Received')
                    )
                ),
                renderPaymentsTab()
            );
        }
        if (activeTab === 'salary') {
            return renderSalaryTab();
        }
        return renderComplaintsTab();
    };

    return React.createElement('div', { className: 'dashboard-container' },
        React.createElement('div', { className: 'sidebar' },
            React.createElement('div', { className: 'sidebar-logo' }, '✂️ LEVIS.BARBER'),
            React.createElement('div', { className: 'sidebar-nav' },
                React.createElement('button', { className: `nav-btn ${activeTab === 'appointments' ? 'active' : ''}`, onClick: () => setActiveTab('appointments') }, '📅 Appointments'),
                React.createElement('button', { className: `nav-btn ${activeTab === 'payments' ? 'active' : ''}`, onClick: () => setActiveTab('payments') }, '💰 Payments'),
                React.createElement('button', { className: `nav-btn ${activeTab === 'salary' ? 'active' : ''}`, onClick: () => setActiveTab('salary') }, '💵 My Salary'),
                React.createElement('button', { className: `nav-btn ${activeTab === 'complaints' ? 'active' : ''}`, onClick: () => setActiveTab('complaints') }, '📝 Complaints')
            ),
            React.createElement('div', { className: 'sidebar-footer' },
                React.createElement('div', null, `✂️ ${user?.full_name || 'Employee'}`),
                React.createElement('button', { className: 'logout-btn', onClick: onLogout }, 'Logout')
            )
        ),
        React.createElement('div', { className: 'main-content' }, renderContent())
    );
}

export default EmployeeDashboard;