import { useState, useEffect } from 'react';
import { adminAPI } from '../utils/api';

export default function AdminDashboard({ onBack }) {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [dashboardStats, setDashboardStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [cards, setCards] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [dailySummary, setDailySummary] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  useEffect(() => {
    if (activeTab === 'users') loadUsers();
    else if (activeTab === 'cards') loadCards();
    else if (activeTab === 'transactions') loadTransactions();
    else if (activeTab === 'daily') loadDailySummary();
  }, [activeTab, selectedDate]);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const response = await adminAPI.getDashboard();
      setDashboardStats(response.data);
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadUsers = async () => {
    try {
      const response = await adminAPI.getUsers();
      setUsers(response.data || []);
    } catch (error) {
      console.error('Error loading users:', error);
    }
  };

  const loadCards = async () => {
    try {
      const response = await adminAPI.getAllCards();
      setCards(response.data || []);
    } catch (error) {
      console.error('Error loading cards:', error);
    }
  };

  const loadTransactions = async () => {
    try {
      const response = await adminAPI.getAllTransactions();
      setTransactions(response.data || []);
    } catch (error) {
      console.error('Error loading transactions:', error);
    }
  };

  const loadDailySummary = async () => {
    try {
      const response = await adminAPI.getDailySummary(selectedDate);
      setDailySummary(response.data);
    } catch (error) {
      console.error('Error loading daily summary:', error);
    }
  };

  const handleToggleUserStatus = async (userId) => {
    if(!window.confirm("Are you sure you want to change this user's status?")) return;
    try {
      await adminAPI.toggleUserStatus(userId);
      loadUsers();
    } catch (error) {
      console.error('Error toggling user status:', error);
    }
  };

  const handleExportTransactions = () => {
    adminAPI.exportTransactions();
  };

  // --- UI Components ---

  const NavItem = ({ id, label, icon }) => (
    <button
      onClick={() => setActiveTab(id)}
      className={`w-full flex items-center space-x-3 px-6 py-4 text-sm font-medium transition-colors ${
        activeTab === id
          ? 'bg-slate-800 text-white border-r-4 border-indigo-500'
          : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
      }`}
    >
      {icon}
      <span>{label}</span>
    </button>
  );

  const StatCard = ({ title, value, subtext, icon, color }) => (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex items-start justify-between">
      <div>
        <p className="text-sm font-medium text-slate-500 mb-1">{title}</p>
        <h3 className="text-2xl font-bold text-slate-900">{value}</h3>
        {subtext && <p className="text-xs text-slate-400 mt-2">{subtext}</p>}
      </div>
      <div className={`p-3 rounded-lg ${color} bg-opacity-10`}>
        {icon}
      </div>
    </div>
  );

  if (loading && activeTab === 'dashboard') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <svg className="animate-spin h-10 w-10 text-indigo-600" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans text-slate-900">
      
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-white hidden md:flex flex-col flex-shrink-0 transition-all duration-300 z-20">
        <div className="h-16 flex items-center px-6 border-b border-slate-800">
          <span className="text-xl font-bold tracking-wider">ADMIN<span className="text-indigo-500">PANEL</span></span>
        </div>
        
        <nav className="flex-1 overflow-y-auto py-4">
          <NavItem 
            id="dashboard" 
            label="Overview" 
            icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>}
          />
          <NavItem 
            id="users" 
            label="User Management" 
            icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>}
          />
          <NavItem 
            id="cards" 
            label="Cards" 
            icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>}
          />
          <NavItem 
            id="transactions" 
            label="Transactions" 
            icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>}
          />
          <NavItem 
            id="daily" 
            label="Daily Reports" 
            icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>}
          />
        </nav>

        <div className="p-4 border-t border-slate-800">
          <button
            onClick={onBack}
            className="w-full flex items-center justify-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition-colors text-sm font-medium"
          >
            <span>Exit Admin</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto h-screen">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-slate-200 sticky top-0 z-10 px-8 py-4 flex justify-between items-center">
          <h2 className="text-xl font-bold text-slate-800 capitalize">
            {activeTab === 'daily' ? 'Daily Summary' : activeTab}
          </h2>
          <div className="flex items-center space-x-4">
             <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-xs border border-indigo-200">
               AD
             </div>
             <span className="text-sm font-medium text-slate-600">Administrator</span>
          </div>
        </header>

        <div className="p-8">
          
          {/* DASHBOARD TAB */}
          {activeTab === 'dashboard' && dashboardStats && (
            <div className="space-y-8 animate-fade-in">
              {/* Primary Stats */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard 
                  title="Total Revenue" 
                  value={`$${dashboardStats.total_revenue.toLocaleString(undefined, {minimumFractionDigits: 2})}`} 
                  icon={<svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
                  color="bg-green-100 text-green-600"
                />
                <StatCard 
                  title="Total Transactions" 
                  value={dashboardStats.total_transactions} 
                  icon={<svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>}
                  color="bg-blue-100 text-blue-600"
                />
                <StatCard 
                  title="Total Users" 
                  value={dashboardStats.total_users} 
                  icon={<svg className="w-6 h-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>}
                  color="bg-purple-100 text-purple-600"
                />
                <StatCard 
                  title="Active Cards" 
                  value={dashboardStats.total_cards} 
                  icon={<svg className="w-6 h-6 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>}
                  color="bg-orange-100 text-orange-600"
                />
              </div>

              {/* Secondary Info */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                  <h3 className="font-bold text-slate-800 mb-4">Activity Overview</h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                      <span className="text-slate-600 text-sm">Today's Volume</span>
                      <span className="font-bold text-slate-900">{dashboardStats.today_transactions}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                      <span className="text-slate-600 text-sm">Today's Revenue</span>
                      <span className="font-bold text-green-600">+${dashboardStats.today_revenue.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                      <span className="text-slate-600 text-sm">Weekly Volume</span>
                      <span className="font-bold text-slate-900">{dashboardStats.week_transactions}</span>
                    </div>
                  </div>
                </div>
                
                <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                  <h3 className="font-bold text-slate-800 mb-4">Transaction Health</h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center p-4 rounded-lg bg-green-50 border border-green-100">
                      <p className="text-green-600 font-bold text-xl">{dashboardStats.status_breakdown.success}</p>
                      <p className="text-xs text-green-800 uppercase tracking-wide mt-1">Successful</p>
                    </div>
                    <div className="text-center p-4 rounded-lg bg-red-50 border border-red-100">
                      <p className="text-red-600 font-bold text-xl">{dashboardStats.status_breakdown.failed}</p>
                      <p className="text-xs text-red-800 uppercase tracking-wide mt-1">Failed</p>
                    </div>
                    <div className="text-center p-4 rounded-lg bg-yellow-50 border border-yellow-100">
                      <p className="text-yellow-600 font-bold text-xl">{dashboardStats.status_breakdown.pending}</p>
                      <p className="text-xs text-yellow-800 uppercase tracking-wide mt-1">Pending</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* USERS TAB */}
          {activeTab === 'users' && (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden animate-fade-in">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-xs uppercase text-slate-500 font-semibold tracking-wider">
                      <th className="px-6 py-4">ID</th>
                      <th className="px-6 py-4">User Details</th>
                      <th className="px-6 py-4">Role</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {users.map(user => (
                      <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4 text-sm text-slate-500 font-mono">#{user.id}</td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col">
                            <span className="font-medium text-slate-900">{user.first_name} {user.last_name}</span>
                            <span className="text-xs text-slate-500">{user.email}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${user.is_staff ? 'bg-purple-100 text-purple-700' : 'bg-slate-100 text-slate-600'}`}>
                            {user.is_staff ? 'Administrator' : 'Customer'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${user.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                            {user.is_active ? 'Active' : 'Suspended'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          {!user.is_staff && (
                            <button
                              onClick={() => handleToggleUserStatus(user.id)}
                              className={`text-xs font-medium hover:underline ${user.is_active ? 'text-red-600 hover:text-red-800' : 'text-green-600 hover:text-green-800'}`}
                            >
                              {user.is_active ? 'Deactivate User' : 'Activate User'}
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* CARDS TAB */}
          {activeTab === 'cards' && (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden animate-fade-in">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-xs uppercase text-slate-500 font-semibold tracking-wider">
                      <th className="px-6 py-4">Card ID</th>
                      <th className="px-6 py-4">Owner</th>
                      <th className="px-6 py-4">Card Details</th>
                      <th className="px-6 py-4">Expiry</th>
                      <th className="px-6 py-4">Date Added</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {cards.map(card => (
                      <tr key={card.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4 text-sm text-slate-500 font-mono">#{card.id}</td>
                        <td className="px-6 py-4 text-sm font-medium text-slate-900">{card.user?.username || 'Unknown'}</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                             <div className="bg-slate-100 text-xs font-bold px-1.5 py-0.5 rounded border border-slate-200">{card.card_type}</div>
                             <span className="font-mono text-sm text-slate-600">{card.masked_number}</span>
                          </div>
                          <div className="text-xs text-slate-400 mt-0.5 uppercase">{card.card_holder_name}</div>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-600">{card.expiry_month}/{card.expiry_year}</td>
                        <td className="px-6 py-4 text-sm text-slate-500">{new Date(card.created_at).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TRANSACTIONS TAB */}
          {activeTab === 'transactions' && (
            <div className="space-y-4 animate-fade-in">
              <div className="flex justify-end">
                <button
                  onClick={handleExportTransactions}
                  className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium shadow-sm transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                  <span>Export to CSV</span>
                </button>
              </div>
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-xs uppercase text-slate-500 font-semibold tracking-wider">
                        <th className="px-6 py-4">Txn ID</th>
                        <th className="px-6 py-4">User</th>
                        <th className="px-6 py-4">Amount</th>
                        <th className="px-6 py-4">Method</th>
                        <th className="px-6 py-4">Status</th>
                        <th className="px-6 py-4">Timestamp</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {transactions.map(txn => (
                        <tr key={txn.id} className="hover:bg-slate-50 transition-colors">
                          <td className="px-6 py-4 text-sm text-slate-500 font-mono">#{txn.id}</td>
                          <td className="px-6 py-4 text-sm font-medium text-slate-900">{txn.user_name}</td>
                          <td className="px-6 py-4">
                            <span className="text-sm font-bold text-slate-900">${parseFloat(txn.amount).toFixed(2)}</span>
                            <span className="text-xs text-slate-500 ml-1">{txn.currency}</span>
                          </td>
                          <td className="px-6 py-4 text-sm text-slate-500">
                            {txn.card_details ? `${txn.card_details.card_type} •• ${txn.card_details.last_four_digits}` : '-'}
                          </td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              txn.status === 'SUCCESS' ? 'bg-green-100 text-green-800' :
                              txn.status === 'FAILED' ? 'bg-red-100 text-red-800' :
                              'bg-yellow-100 text-yellow-800'
                            }`}>
                              {txn.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-slate-500">
                            {new Date(txn.transaction_date).toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* DAILY REPORT TAB */}
          {activeTab === 'daily' && (
            <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
              <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col sm:flex-row gap-4 items-end sm:items-center justify-between">
                <div className="w-full sm:w-auto">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Report Date</label>
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="block w-full px-4 py-2 rounded-lg border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  />
                </div>
              </div>

              {dailySummary ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 border-l-4 border-l-slate-800">
                     <p className="text-sm text-slate-500 mb-1">Processed Volume</p>
                     <p className="text-3xl font-bold text-slate-900">${dailySummary.total_amount.toFixed(2)}</p>
                  </div>
                  <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 border-l-4 border-l-green-500">
                     <p className="text-sm text-slate-500 mb-1">Net Revenue</p>
                     <p className="text-3xl font-bold text-green-600">${dailySummary.successful_amount.toFixed(2)}</p>
                  </div>
                  <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                     <p className="text-sm font-bold text-slate-800 mb-4">Transaction Count</p>
                     <div className="space-y-2">
                       <div className="flex justify-between text-sm"><span className="text-green-600 font-medium">Successful</span> <span>{dailySummary.successful}</span></div>
                       <div className="flex justify-between text-sm"><span className="text-red-600 font-medium">Failed</span> <span>{dailySummary.failed}</span></div>
                       <div className="flex justify-between text-sm"><span className="text-yellow-600 font-medium">Pending</span> <span>{dailySummary.pending}</span></div>
                       <div className="border-t pt-2 flex justify-between font-bold text-slate-900"><span>Total</span> <span>{dailySummary.total_transactions}</span></div>
                     </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 text-slate-400">Select a date to view the daily summary.</div>
              )}
            </div>
          )}

        </div>
      </main>
    </div>
  );
}