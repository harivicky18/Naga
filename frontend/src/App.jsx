import { useState, useEffect } from 'react';
import Register from './components/Register';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import AddCard from './components/AddCard';
import MakePayment from './components/MakePayment';
import TransactionHistory from './components/TransactionHistory';
import AdminDashboard from './components/AdminDashboard';

function App() {
  const [currentPage, setCurrentPage] = useState('login');
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const token = localStorage.getItem('access_token');
    
    if (storedUser && token) {
      setUser(JSON.parse(storedUser));
      setCurrentPage('dashboard');
    }
  }, []);

  const handleLoginSuccess = (userData) => {
    setUser(userData);
    setCurrentPage('dashboard');
  };

  const handleRegisterSuccess = (userData) => {
    setUser(userData);
    setCurrentPage('dashboard');
  };

  const handleLogout = () => {
    setUser(null);
    setCurrentPage('login');
  };

  const handleNavigate = (page) => {
    setCurrentPage(page);
  };

  return (
    <div className="App">
      {currentPage === 'login' && (
        <Login
          onSuccess={handleLoginSuccess}
          onSwitchToRegister={() => setCurrentPage('register')}
        />
      )}
      
      {currentPage === 'register' && (
        <Register
          onSuccess={handleRegisterSuccess}
          onSwitchToLogin={() => setCurrentPage('login')}
        />
      )}
      
      {currentPage === 'dashboard' && user && (
        <Dashboard
          user={user}
          onNavigate={handleNavigate}
          onLogout={handleLogout}
        />
      )}
      
      {currentPage === 'addCard' && user && (
        <AddCard onBack={() => setCurrentPage('dashboard')} />
      )}
      
      {currentPage === 'makePayment' && user && (
        <MakePayment onBack={() => setCurrentPage('dashboard')} />
      )}
      
      {currentPage === 'transactions' && user && (
        <TransactionHistory onBack={() => setCurrentPage('dashboard')} />
      )}
      
      {currentPage === 'admin' && user && user.is_staff && (
        <AdminDashboard onBack={() => setCurrentPage('dashboard')} />
      )}
    </div>
  );
}

export default App;