import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL =
  process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

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
      const apptsRes = await axios.get(
        `${API_URL}/employee/appointments/${employeeId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const salaryRes = await axios.get(
        `${API_URL}/employee/salary/${employeeId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const complaintsRes = await axios.get(
        `${API_URL}/employee/my-complaints`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

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
      await axios.put(
        `${API_URL}/employee/appointments/${id}/status`,
        { status },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      fetchData();
      alert(`Appointment ${status.toLowerCase()}!`);
    } catch (error) {
      console.error(error);
    }
  };

  const downloadSalary = async () => {
    try {
      const response = await axios.get(
        `${API_URL}/employee/download-salary/${employeeId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          responseType: 'blob',
        }
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));

      const link = document.createElement('a');
      link.href = url;
      link.setAttribute(
        'download',
        `salary_slip_${employeeId}.csv`
      );

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
      await axios.post(
        `${API_URL}/employee/complaint`,
        {
          subject: complaintSubject,
          message: complaintMessage,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

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
    return (
      <div
        style={{
          padding: '20px',
          color: 'white',
          textAlign: 'center',
        }}
      >
        Loading Employee Dashboard...
      </div>
    );
  }

  const totalIncome = appointments
    .filter((a) => a.payment_status === 'PAID')
    .reduce(
      (sum, a) => sum + (parseFloat(a.amount) || 0),
      0
    );

  const styles = {
    container: {
      display: 'flex',
      minHeight: '100vh',
    },

    sidebar: {
      width: '260px',
      background: '#2c3e50',
      color: 'white',
      display: 'flex',
      flexDirection: 'column',
    },

    sidebarLogo: {
      padding: '20px',
      textAlign: 'center',
      fontSize: '20px',
      fontWeight: 'bold',
      borderBottom: '1px solid #ff6a00',
    },

    sidebarNav: {
      flex: 1,
      padding: '20px',
    },

    navBtn: {
      display: 'block',
      width: '100%',
      padding: '12px',
      marginBottom: '10px',
      background: 'transparent',
      border: 'none',
      color: 'white',
      textAlign: 'left',
      cursor: 'pointer',
    },

    activeNavBtn: {
      background: '#ff6a00',
      color: 'black',
    },

    sidebarFooter: {
      padding: '20px',
      borderTop: '1px solid #ff6a00',
      textAlign: 'center',
    },

    mainContent: {
      flex: 1,
      padding: '30px',
      color: 'white',
    },

    statCard: {
      background: 'rgba(0,0,0,0.5)',
      border: '1px solid #ff6a00',
      borderRadius: '12px',
      padding: '20px',
      textAlign: 'center',
      marginBottom: '20px',
    },

    statValue: {
      fontSize: '32px',
      fontWeight: 'bold',
      color: '#ff6a00',
      margin: '10px 0',
    },

    table: {
      width: '100%',
      background: 'rgba(0,0,0,0.5)',
      borderCollapse: 'collapse',
    },

    th: {
      padding: '12px',
      textAlign: 'left',
      borderBottom: '1px solid rgba(255,106,0,0.3)',
      background: '#ff6a00',
      color: 'black',
    },

    td: {
      padding: '12px',
      textAlign: 'left',
      borderBottom: '1px solid rgba(255,106,0,0.3)',
    },

    btnOrange: {
      background: '#ff6a00',
      color: 'white',
      border: 'none',
      padding: '10px 20px',
      borderRadius: '8px',
      cursor: 'pointer',
      fontWeight: 'bold',
    },

    btnSuccess: {
      background: '#28a745',
      color: 'white',
      border: 'none',
      padding: '6px 12px',
      borderRadius: '4px',
      cursor: 'pointer',
      marginRight: '5px',
    },

    btnDanger: {
      background: '#dc3545',
      color: 'white',
      border: 'none',
      padding: '6px 12px',
      borderRadius: '4px',
      cursor: 'pointer',
    },

    inputField: {
      width: '100%',
      padding: '12px',
      marginBottom: '15px',
      background: 'rgba(0,0,0,0.6)',
      border: '1px solid #ff6a00',
      borderRadius: '8px',
      color: 'white',
    },

    complaintCard: {
      background: 'rgba(0,0,0,0.5)',
      border: '1px solid #ff6a00',
      borderRadius: '16px',
      padding: '20px',
      marginBottom: '20px',
    },

    replyBox: {
      background: 'rgba(255,106,0,0.1)',
      borderLeft: '3px solid #ff6a00',
      padding: '15px',
      marginTop: '15px',
      borderRadius: '10px',
    },
  };

  const getNavBtnStyle = (tabName) => ({
    ...styles.navBtn,
    ...(activeTab === tabName
      ? styles.activeNavBtn
      : {}),
  });

  return (
    <div style={styles.container}>
      <div style={styles.sidebar}>
        <div style={styles.sidebarLogo}>
          ✂️ LEVIS.BARBER
        </div>

        <div style={styles.sidebarNav}>
          <button
            style={getNavBtnStyle('appointments')}
            onClick={() =>
              setActiveTab('appointments')
            }
          >
            📅 Appointments
          </button>

          <button
            style={getNavBtnStyle('payments')}
            onClick={() =>
              setActiveTab('payments')
            }
          >
            💰 Payments
          </button>

          <button
            style={getNavBtnStyle('salary')}
            onClick={() => setActiveTab('salary')}
          >
            💵 My Salary
          </button>

          <button
            style={getNavBtnStyle('complaints')}
            onClick={() =>
              setActiveTab('complaints')
            }
          >
            📝 Complaints
          </button>
        </div>

        <div style={styles.sidebarFooter}>
          <div>
            ✂️ {user?.full_name || 'Employee'}
          </div>

          <button
            style={{
              ...styles.btnDanger,
              marginTop: '10px',
              width: '100%',
            }}
            onClick={onLogout}
          >
            Logout
          </button>
        </div>
      </div>

      <div style={styles.mainContent}>
        <h2>Employee Dashboard</h2>
      </div>
    </div>
  );
}

export default EmployeeDashboard;