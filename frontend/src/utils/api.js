const DJANGO_API = 'http://localhost:8000/api';
const FASTAPI_API = 'http://localhost:8001';

// Get auth token from localStorage
const getAuthToken = () => {
  return localStorage.getItem('access_token');
};

// Get auth headers
const getAuthHeaders = () => {
  const token = getAuthToken();
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  };
};

// Generic API request function
const apiRequest = async (url, options = {}) => {
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        ...getAuthHeaders(),
        ...options.headers
      }
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'API request failed');
    }
    
    return data;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

// Authentication APIs
export const authAPI = {
  register: (userData) => apiRequest(`${DJANGO_API}/auth/register/`, {
    method: 'POST',
    body: JSON.stringify(userData)
  }),
  
  login: (credentials) => apiRequest(`${DJANGO_API}/auth/login/`, {
    method: 'POST',
    body: JSON.stringify(credentials)
  }),
  
  logout: (refreshToken) => apiRequest(`${DJANGO_API}/auth/logout/`, {
    method: 'POST',
    body: JSON.stringify({ refresh_token: refreshToken })
  }),
  
  getProfile: () => apiRequest(`${DJANGO_API}/auth/profile/`)
};

// Card APIs
export const cardAPI = {
  addCard: (cardData) => apiRequest(`${DJANGO_API}/cards/add/`, {
    method: 'POST',
    body: JSON.stringify(cardData)
  }),
  
  listCards: () => apiRequest(`${DJANGO_API}/cards/list/`),
  
  getCard: (cardId) => apiRequest(`${DJANGO_API}/cards/${cardId}/`),
  
  deleteCard: (cardId) => apiRequest(`${DJANGO_API}/cards/${cardId}/delete/`, {
    method: 'DELETE'
  })
};

// Transaction APIs
export const transactionAPI = {
  createTransaction: (transactionData) => apiRequest(`${DJANGO_API}/transactions/create/`, {
    method: 'POST',
    body: JSON.stringify(transactionData)
  }),
  
  listTransactions: (filters = {}) => {
    const params = new URLSearchParams(filters).toString();
    return apiRequest(`${DJANGO_API}/transactions/list/${params ? '?' + params : ''}`);
  },
  
  getTransaction: (transactionId) => apiRequest(`${DJANGO_API}/transactions/${transactionId}/`)
};

// Payment Processing APIs (FastAPI)
export const paymentAPI = {
  processPayment: (transactionId) => {
    const token = getAuthToken();
    return apiRequest(`${FASTAPI_API}/process-payment`, {
      method: 'POST',
      body: JSON.stringify({ 
        transaction_id: transactionId,
        auth_token: token
      })
    });
  },
  
  getTransactionStatus: (transactionId) => apiRequest(`${FASTAPI_API}/transaction-status/${transactionId}`),
  
  getDummyCards: () => apiRequest(`${FASTAPI_API}/dummy-cards`)
};

// Admin APIs
export const adminAPI = {
  getDashboard: () => apiRequest(`${DJANGO_API}/admin-panel/dashboard/`),
  
  getUsers: () => apiRequest(`${DJANGO_API}/admin-panel/users/`),
  
  getUserDetails: (userId) => apiRequest(`${DJANGO_API}/admin-panel/users/${userId}/`),
  
  toggleUserStatus: (userId) => apiRequest(`${DJANGO_API}/admin-panel/users/${userId}/toggle-status/`, {
    method: 'PATCH'
  }),
  
  getAllCards: () => apiRequest(`${DJANGO_API}/admin-panel/cards/`),
  
  getAllTransactions: (filters = {}) => {
    const params = new URLSearchParams(filters).toString();
    return apiRequest(`${DJANGO_API}/admin-panel/transactions/${params ? '?' + params : ''}`);
  },
  
  getDailySummary: (date) => {
    const params = date ? `?date=${date}` : '';
    return apiRequest(`${DJANGO_API}/admin-panel/daily-summary/${params}`);
  },
  
  exportTransactions: () => {
    const token = getAuthToken();
    
    // Create a temporary anchor element to trigger download
    fetch(`${DJANGO_API}/admin-panel/export-transactions/`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    .then(response => {
      if (!response.ok) {
        throw new Error('Failed to export transactions');
      }
      return response.blob();
    })
    .then(blob => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `transactions_${new Date().getTime()}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    })
    .catch(error => {
      console.error('Export error:', error);
      alert('Failed to export transactions');
    });
  }
};

export default {
  authAPI,
  cardAPI,
  transactionAPI,
  paymentAPI,
  adminAPI
};