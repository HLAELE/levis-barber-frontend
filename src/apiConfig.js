const rawApiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';
const normalizedBase = rawApiUrl.replace(/\/+$|\s+/g, '');
const API_URL = normalizedBase.endsWith('/api') ? normalizedBase : `${normalizedBase}/api`;

export default API_URL;
