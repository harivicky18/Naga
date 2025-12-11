import { useState, useEffect } from 'react';
import { cardAPI, transactionAPI } from '../utils/api';

export default function Dashboard({ user, onNavigate, onLogout }) {
  const [cards, setCards] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [cardsRes, transactionsRes] = await Promise.all([
        cardAPI.listCards(),
        transactionAPI.listTransactions()
      ]);
      
      setCards(cardsRes.data || []);
      setTransactions(transactionsRes.data || []);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    onLogout();
  };

  const recentTransactions = transactions.slice(0, 5);
  const successfulTransactions = transactions.filter(t => t.status === 'SUCCESS');
  const totalSpent = successfulTransactions.reduce((sum, t) => sum + parseFloat(t.amount), 0);

  // Status Badge Helper
  const getStatusColor = (status) => {
    switch(status) {
      case 'SUCCESS': return 'bg-green-100 text-green-700 border-green-200';
      case 'FAILED': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-yellow-100 text-yellow-700 border-yellow-200';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center">
          <svg className="animate-spin h-10 w-10 text-indigo-600 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span className="text-gray-500 font-medium">Loading Dashboard...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      
      {/* Navigation Bar */}
      <nav className="bg-white sticky top-0 z-50 border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0 flex items-center gap-2">
                <div className="h-8 w-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold">P</div>
                <h1 className="text-xl font-bold text-slate-800 tracking-tight">PayGate</h1>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="hidden md:flex flex-col text-right mr-2">
                <span className="text-sm font-semibold text-slate-700">{user.first_name || user.username}</span>
                <span className="text-xs text-slate-500">{user.email}</span>
              </div>
              
              <div className="flex items-center gap-2">
                {user.is_staff && (
                  <button
                    onClick={() => onNavigate('admin')}
                    className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-colors"
                    title="Admin Panel"
                  >
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </button>
                )}
                
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors border border-red-100"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] border border-slate-100 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">Total Spent</p>
              <p className="text-3xl font-bold text-slate-900 mt-1">${totalSpent.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
            </div>
            <div className="h-12 w-12 bg-indigo-50 rounded-full flex items-center justify-center">
              <svg className="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] border border-slate-100 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">Active Cards</p>
              <p className="text-3xl font-bold text-slate-900 mt-1">{cards.length}</p>
            </div>
            <div className="h-12 w-12 bg-blue-50 rounded-full flex items-center justify-center">
              <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] border border-slate-100 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">Transactions</p>
              <p className="text-3xl font-bold text-slate-900 mt-1">{transactions.length}</p>
            </div>
            <div className="h-12 w-12 bg-emerald-50 rounded-full flex items-center justify-center">
              <svg className="h-6 w-6 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <button
            onClick={() => onNavigate('makePayment')}
            className="group relative overflow-hidden bg-indigo-600 text-white p-6 rounded-xl shadow-lg hover:bg-indigo-700 transition-all duration-300 flex items-center justify-between"
          >
            <div className="relative z-10 text-left">
              <h3 className="text-xl font-bold mb-1">Make a Payment</h3>
              <p className="text-indigo-100 text-sm">Send money instantly and securely.</p>
            </div>
            <div className="h-12 w-12 bg-white/20 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
              <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
          </button>
          
          <button
            onClick={() => onNavigate('addCard')}
            className="group relative overflow-hidden bg-white border-2 border-dashed border-slate-300 text-slate-600 p-6 rounded-xl hover:border-indigo-500 hover:text-indigo-600 hover:bg-indigo-50 transition-all duration-300 flex items-center justify-between"
          >
            <div className="text-left">
              <h3 className="text-xl font-bold mb-1">Add New Card</h3>
              <p className="text-slate-500 text-sm group-hover:text-indigo-500/80">Link a new credit or debit card.</p>
            </div>
            <div className="h-12 w-12 bg-slate-100 rounded-full flex items-center justify-center group-hover:bg-indigo-100 transition-colors">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
          </button>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Cards Section */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-gray-50/50">
                <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  <svg className="h-5 w-5 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                  Your Cards
                </h2>
                <button onClick={() => onNavigate('addCard')} className="text-sm text-indigo-600 font-medium hover:text-indigo-800">
                  View All
                </button>
              </div>
              
              <div className="p-6">
                {cards.length === 0 ? (
                  <div className="text-center py-8 text-slate-400">
                    <p>No cards added yet.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {cards.slice(0, 4).map(card => (
                      <div key={card.id} className="relative overflow-hidden bg-gradient-to-br from-slate-700 to-slate-900 text-white p-5 rounded-2xl shadow-lg transition transform hover:-translate-y-1 hover:shadow-xl">
                        {/* Decorative background element */}
                        <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 rounded-full bg-white opacity-5"></div>
                        <div className="absolute bottom-0 left-0 -ml-8 -mb-8 w-32 h-32 rounded-full bg-indigo-500 opacity-10"></div>
                        
                        <div className="relative z-10 flex flex-col justify-between h-32">
                          <div className="flex justify-between items-start">
                            <span className="text-xs font-semibold tracking-wider uppercase opacity-80">{card.card_type}</span>
                            <svg className="h-8 w-10 opacity-80" viewBox="0 0 48 48" fill="none">
                              <path d="M45 35c0 2.209-1.791 4-4 4H7c-2.209 0-4-1.791-4-4V13c0-2.209 1.791-4 4-4h34c2.209 0 4 1.791 4 4v22z" fill="#ffffff" fillOpacity="0"/>
                              <rect x="6" y="16" width="36" height="8" rx="2" fill="#ffffff" fillOpacity="0.2"/>
                              <rect x="8" y="28" width="8" height="4" rx="1" fill="#ffffff" fillOpacity="0.5"/>
                            </svg>
                          </div>
                          
                          <div>
                            <div className="text-lg font-mono tracking-widest text-shadow-sm mb-2">{card.masked_number}</div>
                            <div className="flex justify-between items-end">
                              <div className="flex flex-col">
                                <span className="text-[10px] uppercase opacity-60">Expires</span>
                                <span className="text-sm font-medium">{card.expiry_month}/{card.expiry_year}</span>
                              </div>
                              <span className="text-xs opacity-75">CVV ***</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Recent Transactions Section */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 h-full">
              <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-gray-50/50">
                <h2 className="text-lg font-bold text-slate-800">Recent Activity</h2>
                <button onClick={() => onNavigate('transactions')} className="text-sm text-indigo-600 font-medium hover:text-indigo-800">
                  View All
                </button>
              </div>
              
              <div className="p-0">
                {recentTransactions.length === 0 ? (
                  <div className="p-6 text-center text-slate-400">No transactions found.</div>
                ) : (
                  <ul className="divide-y divide-slate-100">
                    {recentTransactions.map(txn => (
                      <li key={txn.id} className="p-4 hover:bg-slate-50 transition-colors">
                        <div className="flex justify-between items-start">
                          <div className="flex items-start space-x-3">
                            <div className={`mt-1 p-2 rounded-full ${txn.status === 'SUCCESS' ? 'bg-green-100 text-green-600' : 'bg-slate-100 text-slate-500'}`}>
                              {txn.status === 'SUCCESS' ? (
                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                </svg>
                              ) : (
                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                              )}
                            </div>
                            <div>
                              <p className="text-sm font-medium text-slate-900">{txn.description || 'Payment Transaction'}</p>
                              <p className="text-xs text-slate-500 mt-0.5">
                                {new Date(txn.transaction_date).toLocaleDateString()} • {new Date(txn.transaction_date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-bold text-slate-900">-${parseFloat(txn.amount).toFixed(2)}</p>
                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${getStatusColor(txn.status)} mt-1`}>
                              {txn.status}
                            </span>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
          
        </div>
      </main>
    </div>
  );
}