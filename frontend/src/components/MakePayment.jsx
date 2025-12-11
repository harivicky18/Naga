import { useState, useEffect } from 'react';
import { cardAPI, transactionAPI, paymentAPI } from '../utils/api';

export default function MakePayment({ onBack }) {
  const [cards, setCards] = useState([]);
  const [formData, setFormData] = useState({
    card_id: '',
    amount: '',
    currency: 'USD',
    description: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    loadCards();
  }, []);

  const loadCards = async () => {
    try {
      const response = await cardAPI.listCards();
      setCards(response.data || []);
    } catch (error) {
      console.error('Error loading cards:', error);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      // Step 1: Create transaction in Django
      const transactionResponse = await transactionAPI.createTransaction(formData);
      
      if (transactionResponse.status === 'success') {
        const transactionId = transactionResponse.data.id;
        
        setLoading(false); // Stop generic loading, start specific processing
        setProcessing(true);
        
        // Step 2: Process payment via FastAPI
        try {
          // Simulate a slight delay for better UX animation (optional)
          await new Promise(resolve => setTimeout(resolve, 1500));
          
          const paymentResponse = await paymentAPI.processPayment(transactionId);
          
          if (paymentResponse.payment_status === 'SUCCESS') {
            setSuccess(`Payment successful! Transaction ID: ${transactionId}`);
            // Reset form
            setFormData({
              card_id: '',
              amount: '',
              currency: 'USD',
              description: ''
            });
          } else {
            setError(`Payment failed: ${paymentResponse.message}`);
          }
        } catch (paymentError) {
          setError('Payment processing failed. Please try again.');
        } finally {
          setProcessing(false);
        }
      }
    } catch (err) {
      setError(err.message || 'Failed to initiate transaction');
      setLoading(false);
    }
  };

  // Helper for Currency Symbol
  const getCurrencySymbol = (curr) => {
    switch(curr) {
      case 'EUR': return '€';
      case 'GBP': return '£';
      case 'INR': return '₹';
      default: return '$';
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 font-sans text-slate-900 relative">
      
      {/* Back Button */}
      <div className="max-w-2xl mx-auto mb-6">
        <button
          onClick={onBack}
          className="flex items-center text-slate-500 hover:text-indigo-600 transition-colors group"
        >
          <div className="h-8 w-8 rounded-full bg-white border border-slate-200 flex items-center justify-center mr-2 group-hover:border-indigo-300 shadow-sm">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </div>
          <span className="font-medium text-sm">Cancel Payment</span>
        </button>
      </div>

      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden relative">
          
          {/* Header */}
          <div className="bg-slate-900 px-8 py-6">
            <h2 className="text-2xl font-bold text-white flex items-center gap-3">
              <div className="h-10 w-10 bg-indigo-500 rounded-lg flex items-center justify-center text-white shadow-lg">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              Make a Payment
            </h2>
            <p className="text-indigo-200 mt-2 text-sm ml-14">Securely transfer funds using your linked cards.</p>
          </div>

          <div className="p-8 relative">
            
            {/* Processing Overlay */}
            {processing && (
              <div className="absolute inset-0 bg-white/90 backdrop-blur-sm z-50 flex flex-col items-center justify-center rounded-b-2xl animate-fade-in">
                <div className="relative">
                  <div className="h-24 w-24 rounded-full border-4 border-indigo-100 animate-ping absolute"></div>
                  <div className="h-24 w-24 rounded-full border-4 border-t-indigo-600 border-r-indigo-600 border-b-indigo-100 border-l-indigo-100 animate-spin"></div>
                </div>
                <h3 className="mt-8 text-xl font-bold text-slate-800">Processing Payment</h3>
                <p className="text-slate-500 mt-2">Connecting to secure gateway...</p>
              </div>
            )}

            {/* Alerts */}
            {error && (
              <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-r-md animate-slide-in">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-red-700 font-medium">{error}</p>
                  </div>
                </div>
              </div>
            )}
            
            {success && (
              <div className="mb-6 bg-green-50 border-l-4 border-green-500 p-4 rounded-r-md animate-slide-in">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-green-700 font-medium">{success}</p>
                  </div>
                </div>
              </div>
            )}

            {cards.length === 0 ? (
              <div className="text-center py-10 bg-slate-50 rounded-xl border border-dashed border-slate-300">
                <div className="mx-auto h-12 w-12 text-slate-400">
                   <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                   </svg>
                </div>
                <h3 className="mt-2 text-sm font-medium text-slate-900">No Payment Methods</h3>
                <p className="mt-1 text-sm text-slate-500">You need to add a card before making a payment.</p>
                <div className="mt-6">
                  <button onClick={onBack} className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700">
                    Add New Card
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                
                {/* Payment Amount Section */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Payment Amount</label>
                  <div className="relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <span className="text-slate-400 text-3xl font-light">{getCurrencySymbol(formData.currency)}</span>
                    </div>
                    <input
                      type="number"
                      name="amount"
                      value={formData.amount}
                      onChange={handleChange}
                      placeholder="0.00"
                      step="0.01"
                      min="0.01"
                      required
                      className="block w-full pl-10 pr-24 py-4 text-3xl font-semibold text-slate-900 placeholder-slate-300 border-slate-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center">
                      <label htmlFor="currency" className="sr-only">Currency</label>
                      <select
                        name="currency"
                        value={formData.currency}
                        onChange={handleChange}
                        className="h-full py-0 pl-2 pr-7 border-transparent bg-transparent text-slate-500 font-medium sm:text-sm rounded-r-md focus:ring-indigo-500 focus:border-indigo-500"
                      >
                        <option value="USD">USD</option>
                        <option value="EUR">EUR</option>
                        <option value="GBP">GBP</option>
                        <option value="INR">INR</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Card Selection */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Select Card</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg className="h-5 w-5 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                      </svg>
                    </div>
                    <select
                      name="card_id"
                      value={formData.card_id}
                      onChange={handleChange}
                      required
                      className="block w-full pl-10 pr-10 py-3 text-base border-slate-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-lg shadow-sm transition-shadow appearance-none bg-white"
                      style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: `right 0.5rem center`, backgroundRepeat: `no-repeat`, backgroundSize: `1.5em 1.5em` }}
                    >
                      <option value="">Choose payment method</option>
                      {cards.map(card => (
                        <option key={card.id} value={card.id}>
                          {card.card_type} •••• {card.masked_number.slice(-4)} (Exp: {card.expiry_month}/{card.expiry_year})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Description (Optional)</label>
                  <div className="relative">
                    <div className="absolute top-3 left-3 pointer-events-none">
                      <svg className="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </div>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      placeholder="What is this payment for?"
                      rows="3"
                      className="block w-full pl-10 pr-3 py-3 border border-slate-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm shadow-sm transition-colors"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading || processing}
                  className="w-full flex justify-center py-4 px-4 border border-transparent rounded-lg shadow-lg text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-slate-300 disabled:cursor-not-allowed transition-all duration-200 transform hover:-translate-y-0.5"
                >
                  {loading ? 'Initiating Transaction...' : 'Confirm & Pay'}
                </button>
              </form>
            )}

            {/* Helper Info */}
            <div className="mt-8 bg-blue-50/50 rounded-xl p-4 border border-blue-100">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-bold text-blue-800">Test Mode Guide</h3>
                  <div className="mt-2 text-xs text-blue-700 space-y-1">
                    <p className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                      Cards ending in <strong>0000-4999</strong> will SUCCEED.
                    </p>
                    <p className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                      Cards ending in <strong>5000-9999</strong> will FAIL.
                    </p>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}