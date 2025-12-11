import { useState, useEffect } from 'react';
import { cardAPI, paymentAPI } from '../utils/api';

export default function AddCard({ onBack }) {
  const [formData, setFormData] = useState({
    card_number: '',
    cvv: '',
    card_holder_name: '',
    expiry_month: '',
    expiry_year: ''
  });
  const [cards, setCards] = useState([]);
  const [dummyCards, setDummyCards] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadCards();
    loadDummyCards();
  }, []);

  const loadCards = async () => {
    try {
      const response = await cardAPI.listCards();
      setCards(response.data || []);
    } catch (error) {
      console.error('Error loading cards:', error);
    }
  };

  const loadDummyCards = async () => {
    try {
      const response = await paymentAPI.getDummyCards();
      setDummyCards(response.cards || []);
    } catch (error) {
      console.error('Error loading dummy cards:', error);
    }
  };

  const handleChange = (e) => {
    let value = e.target.value;
    if (e.target.name === 'card_number') {
      value = value.replace(/\s/g, '');
    }
    setFormData({ ...formData, [e.target.name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const response = await cardAPI.addCard(formData);
      if (response.status === 'success') {
        setSuccess('Card added successfully!');
        setFormData({
          card_number: '',
          cvv: '',
          card_holder_name: '',
          expiry_month: '',
          expiry_year: ''
        });
        loadCards();
        // Auto clear success message after 3 seconds
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (err) {
      setError(err.message || 'Failed to add card');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (cardId) => {
    if (!window.confirm('Are you sure you want to delete this card?')) return;
    try {
      await cardAPI.deleteCard(cardId);
      loadCards();
    } catch (error) {
      setError('Failed to delete card');
    }
  };

  const fillDummyCard = (card) => {
    setFormData({
      card_number: card.number,
      cvv: card.cvv,
      card_holder_name: 'TEST USER',
      expiry_month: card.expiry.split('/')[0],
      expiry_year: '20' + card.expiry.split('/')[1]
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Helper to format card number for display
  const formatCardNumber = (num) => {
    return num ? num.replace(/(\d{4})/g, '$1 ').trim() : '•••• •••• •••• ••••';
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8 font-sans text-slate-900">
      <div className="max-w-7xl mx-auto">
        
        {/* Header / Back Button */}
        <div className="mb-8 flex items-center">
          <button
            onClick={onBack}
            className="group flex items-center text-slate-500 hover:text-indigo-600 transition-colors"
          >
            <div className="h-8 w-8 rounded-full bg-white border border-slate-200 flex items-center justify-center mr-3 group-hover:border-indigo-300 shadow-sm">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </div>
            <span className="font-medium">Back to Dashboard</span>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Form */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden">
              <div className="bg-slate-900 px-6 py-4 border-b border-slate-800">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <svg className="h-5 w-5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                  </svg>
                  Add New Card
                </h2>
              </div>

              <div className="p-6">
                {error && (
                  <div className="mb-4 bg-red-50 border-l-4 border-red-500 p-4 rounded-md flex items-start">
                    <svg className="h-5 w-5 text-red-400 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                )}
                
                {success && (
                  <div className="mb-4 bg-green-50 border-l-4 border-green-500 p-4 rounded-md flex items-start">
                    <svg className="h-5 w-5 text-green-400 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                    <p className="text-sm text-green-700">{success}</p>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Card Number</label>
                    <div className="relative">
                      <input
                        type="text"
                        name="card_number"
                        value={formData.card_number}
                        onChange={handleChange}
                        placeholder="0000 0000 0000 0000"
                        maxLength="19"
                        required
                        className="block w-full pl-10 pr-3 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors font-mono"
                      />
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                        </svg>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Card Holder Name</label>
                    <div className="relative">
                      <input
                        type="text"
                        name="card_holder_name"
                        value={formData.card_holder_name}
                        onChange={handleChange}
                        placeholder="NAME ON CARD"
                        required
                        className="block w-full pl-10 pr-3 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors uppercase"
                      />
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1">Expiry Date</label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          name="expiry_month"
                          value={formData.expiry_month}
                          onChange={handleChange}
                          placeholder="MM"
                          maxLength="2"
                          required
                          className="block w-full px-3 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-center font-mono"
                        />
                        <span className="self-center text-slate-400">/</span>
                        <input
                          type="text"
                          name="expiry_year"
                          value={formData.expiry_year}
                          onChange={handleChange}
                          placeholder="YYYY"
                          maxLength="4"
                          required
                          className="block w-full px-3 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-center font-mono"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1">CVV / CVC</label>
                      <div className="relative">
                        <input
                          type="password"
                          name="cvv"
                          value={formData.cvv}
                          onChange={handleChange}
                          placeholder="123"
                          maxLength="4"
                          required
                          className="block w-full pl-10 pr-3 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 font-mono tracking-widest"
                        />
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-indigo-600 text-white py-3.5 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-300 disabled:cursor-not-allowed font-semibold shadow-lg transition-all duration-200 mt-4"
                  >
                    {loading ? (
                      <span className="flex items-center justify-center gap-2">
                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Processing...
                      </span>
                    ) : 'Link Card Securely'}
                  </button>
                </form>
              </div>
            </div>

            {/* Test Credentials Section */}
            {dummyCards.length > 0 && (
              <div className="bg-white rounded-xl shadow-md border border-slate-200 overflow-hidden">
                <div className="bg-slate-50 px-4 py-3 border-b border-slate-200">
                  <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider">
                    Quick Fill (Test Data)
                  </h3>
                </div>
                <div className="max-h-48 overflow-y-auto p-2">
                  <div className="space-y-1">
                    {dummyCards.map((card, idx) => (
                      <button
                        key={idx}
                        onClick={() => fillDummyCard(card)}
                        className="w-full text-left p-3 rounded-lg hover:bg-indigo-50 border border-transparent hover:border-indigo-100 transition-colors flex items-center justify-between group"
                      >
                        <div className="flex flex-col">
                          <span className="font-semibold text-slate-700 text-sm group-hover:text-indigo-700">{card.type}</span>
                          <span className="text-xs text-slate-400 font-mono">{formatCardNumber(card.number)}</span>
                        </div>
                        <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wide ${
                          card.result === 'SUCCESS' 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-red-100 text-red-700'
                        }`}>
                          {card.result}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Card List */}
          <div className="lg:col-span-7">
            <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
              <svg className="h-5 w-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
              Your Linked Cards
            </h2>
            
            {cards.length === 0 ? (
              <div className="bg-white border-2 border-dashed border-slate-300 rounded-xl p-12 text-center">
                <div className="mx-auto h-16 w-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                  <svg className="h-8 w-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-slate-900">No cards linked yet</h3>
                <p className="mt-1 text-slate-500">Fill out the form to add your first payment method.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {cards.map(card => (
                  <div key={card.id} className="group relative">
                    {/* Visual Card Representation */}
                    <div className="relative h-56 bg-gradient-to-br from-slate-700 to-slate-900 rounded-2xl p-6 text-white shadow-xl overflow-hidden transition-transform duration-300 hover:-translate-y-1">
                      
                      {/* Decorative Circles */}
                      <div className="absolute top-0 right-0 -mr-10 -mt-10 w-40 h-40 bg-white opacity-5 rounded-full"></div>
                      <div className="absolute bottom-0 left-0 -ml-10 -mb-10 w-40 h-40 bg-indigo-500 opacity-10 rounded-full"></div>

                      <div className="flex flex-col justify-between h-full relative z-10">
                        <div className="flex justify-between items-start">
                          <div className="bg-white/20 px-2 py-1 rounded text-xs font-semibold backdrop-blur-sm border border-white/10">
                            {card.card_type}
                          </div>
                          {/* Chip Icon */}
                          <svg className="h-8 w-10 text-yellow-200/80" viewBox="0 0 48 48" fill="none">
                            <rect width="48" height="36" rx="4" fill="currentColor" fillOpacity="0.1"/>
                            <path d="M4 12h8M4 18h8M4 24h8" stroke="currentColor" strokeWidth="2"/>
                          </svg>
                        </div>

                        <div className="mt-4">
                          <p className="font-mono text-xl tracking-widest drop-shadow-md">
                            {formatCardNumber(card.masked_number)}
                          </p>
                        </div>

                        <div className="flex justify-between items-end mt-4">
                          <div>
                            <p className="text-[10px] text-slate-300 uppercase tracking-wider mb-0.5">Card Holder</p>
                            <p className="font-medium text-sm tracking-wide uppercase truncate max-w-[150px]">
                              {card.card_holder_name}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-[10px] text-slate-300 uppercase tracking-wider mb-0.5">Expires</p>
                            <p className="font-medium text-sm">
                              {card.expiry_month}/{card.expiry_year.toString().slice(-2)}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Delete Button (visible on hover) */}
                    <button
                      onClick={() => handleDelete(card.id)}
                      className="absolute -top-3 -right-3 bg-white text-red-500 p-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-red-50 hover:text-red-600 border border-slate-200 z-20"
                      title="Delete Card"
                    >
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}