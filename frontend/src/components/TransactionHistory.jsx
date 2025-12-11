import { useState, useEffect } from 'react';
import { transactionAPI } from '../utils/api';

export default function TransactionHistory({ onBack }) {
  const [transactions, setTransactions] = useState([]);
  const [filters, setFilters] = useState({
    status: '',
    date_from: '',
    date_to: '',
    min_amount: '',
    max_amount: ''
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTransactions();
  }, []);

  const loadTransactions = async () => {
    setLoading(true);
    try {
      const cleanFilters = {};
      Object.keys(filters).forEach(key => {
        if (filters[key]) cleanFilters[key] = filters[key];
      });
      
      const response = await transactionAPI.listTransactions(cleanFilters);
      setTransactions(response.data || []);
    } catch (error) {
      console.error('Error loading transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value
    });
  };

  const handleResetFilters = () => {
    setFilters({
      status: '',
      date_from: '',
      date_to: '',
      min_amount: '',
      max_amount: ''
    });
    setTimeout(() => loadTransactions(), 100); // Small delay to ensure state update
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case 'SUCCESS':
        return 'bg-emerald-100 text-emerald-700 border border-emerald-200';
      case 'FAILED':
        return 'bg-red-100 text-red-700 border border-red-200';
      case 'PENDING':
        return 'bg-amber-100 text-amber-700 border border-amber-200';
      default:
        return 'bg-slate-100 text-slate-700 border border-slate-200';
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8 font-sans text-slate-900">
      <div className="max-w-7xl mx-auto">
        
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
          <div className="flex items-center">
            <button
              onClick={onBack}
              className="group mr-4 p-2 rounded-full bg-white border border-slate-200 text-slate-500 hover:text-indigo-600 hover:border-indigo-300 transition-all shadow-sm"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </button>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Transaction History</h1>
              <p className="text-sm text-slate-500">View and manage your past payments.</p>
            </div>
          </div>
          
          {!loading && (
             <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-100">
               {transactions.length} Records Found
             </span>
          )}
        </div>

        {/* Filters Section */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 mb-8">
          <div className="flex items-center gap-2 mb-4 text-sm font-semibold text-slate-700">
            <svg className="h-4 w-4 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            Filter Transactions
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Status Filter */}
            <div className="relative">
              <select
                name="status"
                value={filters.status}
                onChange={handleFilterChange}
                className="block w-full rounded-lg border-slate-300 bg-slate-50/50 py-2.5 pl-3 pr-10 text-sm focus:border-indigo-500 focus:ring-indigo-500"
              >
                <option value="">All Statuses</option>
                <option value="SUCCESS">Success</option>
                <option value="FAILED">Failed</option>
                <option value="PENDING">Pending</option>
              </select>
            </div>

            {/* Date From */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <input
                type="date"
                name="date_from"
                value={filters.date_from}
                onChange={handleFilterChange}
                className="block w-full rounded-lg border-slate-300 pl-10 py-2.5 text-sm focus:border-indigo-500 focus:ring-indigo-500 placeholder-slate-400"
              />
            </div>

            {/* Date To */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <input
                type="date"
                name="date_to"
                value={filters.date_to}
                onChange={handleFilterChange}
                className="block w-full rounded-lg border-slate-300 pl-10 py-2.5 text-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>

            {/* Min Amount */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-slate-400 sm:text-sm">$</span>
              </div>
              <input
                type="number"
                name="min_amount"
                value={filters.min_amount}
                onChange={handleFilterChange}
                placeholder="Min Amount"
                className="block w-full rounded-lg border-slate-300 pl-8 py-2.5 text-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>

            {/* Max Amount */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-slate-400 sm:text-sm">$</span>
              </div>
              <input
                type="number"
                name="max_amount"
                value={filters.max_amount}
                onChange={handleFilterChange}
                placeholder="Max Amount"
                className="block w-full rounded-lg border-slate-300 pl-8 py-2.5 text-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="mt-4 flex gap-3 justify-end border-t border-slate-100 pt-4">
             <button
              onClick={handleResetFilters}
              className="px-4 py-2 bg-white text-slate-600 border border-slate-300 rounded-lg hover:bg-slate-50 text-sm font-medium transition-colors"
            >
              Reset
            </button>
            <button
              onClick={loadTransactions}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm font-medium shadow-sm transition-colors flex items-center gap-2"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              Apply Filters
            </button>
          </div>
        </div>

        {/* Table Section */}
        <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
               <svg className="animate-spin h-10 w-10 text-indigo-500 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <p className="text-slate-500 text-sm font-medium">Loading transaction data...</p>
            </div>
          ) : transactions.length === 0 ? (
            <div className="text-center py-20 px-4">
              <div className="bg-slate-50 rounded-full h-20 w-20 flex items-center justify-center mx-auto mb-4">
                <svg className="h-10 w-10 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-slate-900">No transactions found</h3>
              <p className="text-slate-500 mt-1 max-w-sm mx-auto">
                We couldn't find any transactions matching your filters. Try adjusting your search criteria.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full whitespace-nowrap">
                <thead>
                  <tr className="bg-slate-50/80 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                    <th className="px-6 py-4">Transaction ID</th>
                    <th className="px-6 py-4">Amount</th>
                    <th className="px-6 py-4">Payment Method</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Date & Time</th>
                    <th className="px-6 py-4">Description</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {transactions.map((txn, index) => (
                    <tr 
                      key={txn.id} 
                      className="hover:bg-slate-50 transition-colors duration-150 ease-in-out group"
                    >
                      <td className="px-6 py-4">
                        <span className="font-mono text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded">
                          #{txn.id}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-bold text-slate-900">
                          {parseFloat(txn.amount).toLocaleString(undefined, {style: 'currency', currency: txn.currency || 'USD'})}
                        </div>
                        <div className="text-xs text-slate-400">{txn.currency || 'USD'}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                           <div className="h-8 w-8 rounded bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center text-white text-[10px] font-bold mr-3 shadow-sm">
                             Card
                           </div>
                           <div>
                             <div className="text-sm font-medium text-slate-700">{txn.card_details?.card_type || 'Unknown'}</div>
                             <div className="text-xs text-slate-400 font-mono">•••• {txn.card_details?.masked_number ? txn.card_details.masked_number.slice(-4) : '????'}</div>
                           </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusStyle(txn.status)}`}>
                          {txn.status === 'SUCCESS' && <svg className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/></svg>}
                          {txn.status === 'FAILED' && <svg className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/></svg>}
                          {txn.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">
                        <div className="flex flex-col">
                          <span className="font-medium">
                            {new Date(txn.transaction_date).toLocaleDateString()}
                          </span>
                          <span className="text-xs text-slate-400">
                            {new Date(txn.transaction_date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-500 max-w-xs truncate" title={txn.description}>
                        {txn.description ? (
                          <span className="text-slate-600">{txn.description}</span>
                        ) : (
                          <span className="text-slate-400 italic">No description</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          
          {/* Footer / Pagination Placeholder */}
          {transactions.length > 0 && (
            <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex items-center justify-between">
              <span className="text-xs text-slate-500">
                Showing all recent transactions
              </span>
              <div className="flex gap-2">
                <button disabled className="px-3 py-1 border border-slate-300 rounded text-xs text-slate-400 bg-slate-100 cursor-not-allowed">Previous</button>
                <button disabled className="px-3 py-1 border border-slate-300 rounded text-xs text-slate-400 bg-slate-100 cursor-not-allowed">Next</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}