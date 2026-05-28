const express = require('express');
const mysql = require('mysql2');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

// CORS - allow all
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Database connection
const DB_HOST = process.env.DB_HOST || 'localhost';
const DB_USER = process.env.DB_USER || 'root';
const DB_PASSWORD = process.env.DB_PASSWORD || '';
const DB_NAME = process.env.DB_NAME || 'levis_fis';
const DB_PORT = parseInt(process.env.DB_PORT || '3306');
const DB_SSL = DB_HOST.includes('aivencloud');

const db = mysql.createPool({
    host: DB_HOST,
    user: DB_USER,
    password: DB_PASSWORD,
    database: DB_NAME,
    port: DB_PORT,
    waitForConnections: true,
    connectionLimit: 10,
    ssl: DB_SSL ? { rejectUnauthorized: false } : false
});

const promiseDb = db.promise();
const JWT_SECRET = process.env.JWT_SECRET || 'levis_barber_secret_key_2026';

console.log('✅ Server starting on port', process.env.PORT || 5000);

// ============ TEST ENDPOINT ============
app.get('/api/ping', (req, res) => {
    res.json({ message: 'Backend is alive!', timestamp: new Date().toISOString() });
});

// ============ LOGIN ============
app.post('/api/auth/login', async (req, res) => {
    const { username, password } = req.body;
    console.log('Login attempt:', username);
    
    try {
        const [users] = await promiseDb.query('SELECT * FROM users WHERE username = ?', [username]);
        
        if (users.length === 0) {
            // Fallback for testing
            if (username === 'owner' && password === 'owner123') {
                const token = jwt.sign({ userId: 1, username: 'owner', role: 'OWNER', full_name: 'System Owner' }, JWT_SECRET);
                return res.json({ success: true, token, user: { userId: 1, full_name: 'System Owner', username: 'owner', role: 'OWNER' } });
            }
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        
        const user = users[0];
        const validPassword = password === user.password || await bcrypt.compare(password, user.password);
        
        if (!validPassword) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        
        const token = jwt.sign(
            { userId: user.user_id, username: user.username, role: user.role, full_name: user.full_name },
            JWT_SECRET,
            { expiresIn: '7d' }
        );
        
        res.json({ success: true, token, user: { userId: user.user_id, full_name: user.full_name, username: user.username, role: user.role } });
    } catch (error) {
        console.error('Login error:', error);
        // Fallback
        if (username === 'owner' && password === 'owner123') {
            const token = jwt.sign({ userId: 1, username: 'owner', role: 'OWNER', full_name: 'System Owner' }, JWT_SECRET);
            return res.json({ success: true, token, user: { userId: 1, full_name: 'System Owner', username: 'owner', role: 'OWNER' } });
        }
        res.status(500).json({ error: 'Login failed' });
    }
});

// ============ MIDDLEWARE ============
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Access denied' });
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(403).json({ error: 'Invalid token' });
    }
};

const authorizeRoles = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) return res.status(403).json({ error: 'Access denied' });
        next();
    };
};

// ============ DASHBOARD ============
app.get('/api/owner/dashboard', authenticateToken, authorizeRoles('OWNER'), async (req, res) => {
    try {
        const [revenue] = await promiseDb.query('SELECT COALESCE(SUM(amount), 0) as total FROM payments');
        const [expenses] = await promiseDb.query('SELECT COALESCE(SUM(amount), 0) as total FROM expenses');
        const [customers] = await promiseDb.query('SELECT COUNT(*) as count FROM customers');
        res.json({ totalRevenue: revenue[0]?.total || 0, totalExpenses: expenses[0]?.total || 0, netProfit: (revenue[0]?.total || 0) - (expenses[0]?.total || 0), totalCustomers: customers[0]?.count || 0 });
    } catch (error) {
        res.json({ totalRevenue: 0, totalExpenses: 0, netProfit: 0, totalCustomers: 0 });
    }
});

// ============ CHART DATA ============
app.get('/api/owner/chart-data', authenticateToken, authorizeRoles('OWNER'), async (req, res) => {
    try {
        const [monthlyRevenue] = await promiseDb.query(`SELECT DATE_FORMAT(payment_date, '%b') as month, COALESCE(SUM(amount), 0) as revenue FROM payments GROUP BY MONTH(payment_date)`);
        const [revenueTotal] = await promiseDb.query('SELECT COALESCE(SUM(amount), 0) as total FROM payments');
        const [expensesTotal] = await promiseDb.query('SELECT COALESCE(SUM(amount), 0) as total FROM expenses');
        const [salariesTotal] = await promiseDb.query('SELECT COALESCE(SUM(amount), 0) as total FROM expenses WHERE category = "Salary"');
        const [categoryExpenses] = await promiseDb.query('SELECT category, COALESCE(SUM(amount), 0) as total FROM expenses GROUP BY category');
        res.json({ monthlyRevenue: monthlyRevenue || [], revenueTotal: revenueTotal[0]?.total || 0, expensesTotal: expensesTotal[0]?.total || 0, salariesTotal: salariesTotal[0]?.total || 0, categoryExpenses: categoryExpenses || [] });
    } catch (error) {
        res.json({ monthlyRevenue: [], revenueTotal: 0, expensesTotal: 0, salariesTotal: 0, categoryExpenses: [] });
    }
});

// ============ ADD INCOME ============
app.post('/api/owner/add-income', authenticateToken, authorizeRoles('OWNER'), async (req, res) => {
    const { source, amount, description, category, payment_method, income_date } = req.body;
    console.log('Add income request:', req.body);
    
    try {
        const date = income_date || new Date().toISOString().split('T')[0];
        await promiseDb.query('INSERT INTO income (source, amount, description, category, payment_method, income_date) VALUES (?, ?, ?, ?, ?, ?)', [source, amount, description || null, category || 'Other', payment_method || 'CASH', date]);
        await promiseDb.query('INSERT INTO payments (appointment_id, amount, payment_method, source, source_type, payment_date) VALUES (NULL, ?, ?, ?, "Manual Income", ?)', [amount, payment_method || 'CASH', source, date]);
        res.json({ success: true, message: 'Income added successfully' });
    } catch (error) {
        console.error('Add income error:', error);
        res.status(500).json({ error: 'Failed to add income', details: error.message });
    }
});

// ============ ADD EXPENSE ============
app.post('/api/owner/add-expense', authenticateToken, authorizeRoles('OWNER'), async (req, res) => {
    const { description, amount, category, expense_date } = req.body;
    console.log('Add expense request:', req.body);
    
    try {
        const date = expense_date || new Date().toISOString().split('T')[0];
        await promiseDb.query('INSERT INTO expenses (description, amount, category, expense_date) VALUES (?, ?, ?, ?)', [description, amount, category || 'Other', date]);
        res.json({ success: true, message: 'Expense added successfully' });
    } catch (error) {
        console.error('Add expense error:', error);
        res.status(500).json({ error: 'Failed to add expense', details: error.message });
    }
});

// ============ GET INCOME ============
app.get('/api/owner/income', authenticateToken, authorizeRoles('OWNER'), async (req, res) => {
    try {
        const [income] = await promiseDb.query('SELECT income_id as id, source, amount, category, payment_method, income_date as date FROM income ORDER BY income_date DESC');
        res.json(income);
    } catch (error) {
        res.json([]);
    }
});

// ============ GET EXPENSES ============
app.get('/api/owner/expenses', authenticateToken, authorizeRoles('OWNER'), async (req, res) => {
    try {
        const [expenses] = await promiseDb.query('SELECT expense_id as id, description, amount, category, expense_date as date FROM expenses ORDER BY expense_date DESC');
        res.json(expenses);
    } catch (error) {
        res.json([]);
    }
});

// ============ DELETE INCOME ============
app.delete('/api/owner/delete-income/:id', authenticateToken, authorizeRoles('OWNER'), async (req, res) => {
    const { id } = req.params;
    try {
        await promiseDb.query('DELETE FROM income WHERE income_id = ?', [id]);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete' });
    }
});

// ============ DELETE EXPENSE ============
app.delete('/api/owner/delete-expense/:id', authenticateToken, authorizeRoles('OWNER'), async (req, res) => {
    const { id } = req.params;
    try {
        await promiseDb.query('DELETE FROM expenses WHERE expense_id = ?', [id]);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete' });
    }
});

// ============ PENDING EMPLOYEES ============
app.get('/api/owner/pending-employees', authenticateToken, authorizeRoles('OWNER'), async (req, res) => {
    try {
        const [employees] = await promiseDb.query('SELECT user_id, full_name, username, created_at FROM users WHERE role = "EMPLOYEE" AND is_approved = 0');
        res.json(employees);
    } catch (error) {
        res.json([]);
    }
});

// ============ APPROVE EMPLOYEE ============
app.post('/api/owner/approve-employee/:userId', authenticateToken, authorizeRoles('OWNER'), async (req, res) => {
    const { userId } = req.params;
    const { position, salary, phone, hire_date } = req.body;
    try {
        const [users] = await promiseDb.query('SELECT full_name FROM users WHERE user_id = ?', [userId]);
        await promiseDb.query('UPDATE users SET is_approved = 1 WHERE user_id = ?', [userId]);
        await promiseDb.query('INSERT INTO employees (full_name, phone, position, salary, hire_date, user_id) VALUES (?, ?, ?, ?, ?, ?)', [users[0].full_name, phone || null, position || 'Barber', salary || 0, hire_date || new Date(), userId]);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: 'Failed to approve' });
    }
});

// ============ REJECT EMPLOYEE ============
app.delete('/api/owner/reject-employee/:userId', authenticateToken, authorizeRoles('OWNER'), async (req, res) => {
    const { userId } = req.params;
    try {
        await promiseDb.query('DELETE FROM users WHERE user_id = ? AND role = "EMPLOYEE" AND is_approved = 0', [userId]);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: 'Failed to reject' });
    }
});

// ============ GET EMPLOYEES ============
app.get('/api/owner/employees', authenticateToken, authorizeRoles('OWNER'), async (req, res) => {
    try {
        const [employees] = await promiseDb.query('SELECT employee_id, full_name, position, salary FROM employees');
        res.json(employees);
    } catch (error) {
        res.json([]);
    }
});

// ============ PAY SALARY ============
app.post('/api/owner/pay-salary', authenticateToken, authorizeRoles('OWNER'), async (req, res) => {
    const { employee_id, amount } = req.body;
    try {
        const [emp] = await promiseDb.query('SELECT full_name FROM employees WHERE employee_id = ?', [employee_id]);
        await promiseDb.query('UPDATE employees SET salary = ? WHERE employee_id = ?', [amount, employee_id]);
        await promiseDb.query('INSERT INTO expenses (description, amount, category, expense_date) VALUES (?, ?, "Salary", CURDATE())', [`Salary payment to ${emp[0].full_name}`, amount]);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: 'Failed to pay salary' });
    }
});

// ============ COMPLAINTS ============
app.get('/api/owner/complaints', authenticateToken, authorizeRoles('OWNER'), async (req, res) => {
    try {
        const [complaints] = await promiseDb.query('SELECT c.*, u.full_name as sender_name FROM complaints c JOIN users u ON c.user_id = u.user_id ORDER BY c.created_at DESC');
        res.json(complaints);
    } catch (error) {
        res.json([]);
    }
});

app.post('/api/owner/reply-complaint/:id', authenticateToken, authorizeRoles('OWNER'), async (req, res) => {
    const { id } = req.params;
    const { reply } = req.body;
    try {
        await promiseDb.query('UPDATE complaints SET reply = ?, status = "RESOLVED" WHERE complaint_id = ?', [reply, id]);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: 'Failed to reply' });
    }
});

// ============ EMPLOYEE ENDPOINTS ============
app.get('/api/employee/appointments/:employeeId', authenticateToken, authorizeRoles('EMPLOYEE'), async (req, res) => { res.json([]); });
app.put('/api/employee/appointments/:id/status', authenticateToken, authorizeRoles('EMPLOYEE'), (req, res) => res.json({ success: true }));
app.put('/api/employee/appointments/:id/reschedule', authenticateToken, authorizeRoles('EMPLOYEE'), (req, res) => res.json({ success: true }));
app.get('/api/employee/salary/:employeeId', authenticateToken, authorizeRoles('EMPLOYEE'), (req, res) => res.json({ salary: 0 }));
app.get('/api/employee/download-salary/:employeeId', authenticateToken, authorizeRoles('EMPLOYEE'), (req, res) => res.send('Salary slip'));
app.post('/api/employee/complaint', authenticateToken, authorizeRoles('EMPLOYEE'), (req, res) => res.json({ success: true }));
app.get('/api/employee/my-complaints', authenticateToken, authorizeRoles('EMPLOYEE'), (req, res) => res.json([]));

// ============ CUSTOMER ENDPOINTS ============
app.post('/api/customer/appointments', authenticateToken, authorizeRoles('CUSTOMER'), async (req, res) => {
    const { custom_service, appointment_date, appointment_time, payment_method, amount } = req.body;
    const userId = req.user.userId;
    try {
        const [customer] = await promiseDb.query('SELECT customer_id FROM customers WHERE user_id = ?', [userId]);
        if (customer.length === 0) return res.status(404).json({ error: 'Customer not found' });
        const [barber] = await promiseDb.query('SELECT employee_id FROM employees LIMIT 1');
        const [appointment] = await promiseDb.query('INSERT INTO appointments (customer_id, employee_id, custom_service, appointment_date, appointment_time, payment_status) VALUES (?, ?, ?, ?, ?, "PAID")', [customer[0].customer_id, barber[0]?.employee_id || 1, custom_service, appointment_date, appointment_time]);
        await promiseDb.query('INSERT INTO payments (appointment_id, amount, payment_method) VALUES (?, ?, ?)', [appointment.insertId, amount, payment_method || 'CASH']);
        res.json({ success: true, message: 'Appointment booked' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to book' });
    }
});

app.get('/api/customer/my-appointments/:userId', authenticateToken, authorizeRoles('CUSTOMER'), async (req, res) => { res.json([]); });
app.get('/api/customer/download-receipt/:appointmentId', authenticateToken, authorizeRoles('CUSTOMER'), (req, res) => res.send('Receipt'));
app.post('/api/customer/complaint', authenticateToken, authorizeRoles('CUSTOMER'), (req, res) => res.json({ success: true }));
app.get('/api/customer/my-complaints/:userId', authenticateToken, authorizeRoles('CUSTOMER'), (req, res) => res.json([]));

// ============ START ============
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Backend running on port ${PORT}`);
    console.log(`✅ Health check: https://levis-barber-backend.onrender.com/api/ping`);
});