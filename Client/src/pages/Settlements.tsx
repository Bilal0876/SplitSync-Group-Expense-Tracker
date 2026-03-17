import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Header from '../components/Header';
import { getSettlementHistory } from '../services/settlementServices';
import type { Settlement } from '../services/settlementServices';

const Settlements: React.FC = () => {
  const { user } = useAuth();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [history, setHistory] = useState<Settlement[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id || !user) return;

    const fetchHistory = async () => {
      try {
        setLoading(true);
        const data = await getSettlementHistory(id);
        setHistory(data);
        setError(null);
      } catch (err: any) {
        if (err?.response?.status === 401) return; // Silent 401
        console.error('Error fetching settlement history:', err);
        setError('Failed to load settlement history.');
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [id, user]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col transition-colors duration-300">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 dark:border-indigo-400"></div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col font-sans transition-colors duration-300">

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
      `}</style>

      <Header />
      <main className="flex-1 w-full max-w-6xl xl:max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-sm font-medium text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
            Back to Group
          </button>
          <h1 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">Settlement History</h1>
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/20 rounded-xl p-4 text-red-600 dark:text-red-400 mb-6 font-semibold text-sm">
            {error}
          </div>
        )}

        {history.length === 0 ? (
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm p-12 text-center border border-gray-100 dark:border-gray-800">
            <div className="w-16 h-16 bg-gray-50 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-gray-300 dark:text-gray-600">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
              </svg>
            </div>
            <h3 className="text-lg font-extrabold text-gray-900 dark:text-white mb-1">No settlements yet</h3>
            <p className="text-gray-400 dark:text-gray-500">When members pay each other back, they'll show up here.</p>
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-800">
                    <th className="px-6 py-4 text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">Date</th>
                    <th className="px-6 py-4 text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">Paid By</th>
                    <th className="px-6 py-4 text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest"></th>
                    <th className="px-6 py-4 text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">Paid To</th>
                    <th className="px-6 py-4 text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                  {history.map((settlement) => (
                    <tr key={settlement.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-500 dark:text-gray-400">
                        {new Date(settlement.settled_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-bold text-gray-900 dark:text-gray-100">{settlement.sender_name || `User ${settlement.sender_id}`}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-gray-300 dark:text-gray-700">
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                          </svg>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-bold text-gray-900 dark:text-gray-100">{settlement.receiver_name || `User ${settlement.receiver_id}`}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <span className="text-sm font-black text-emerald-500 dark:text-emerald-400">${Number(settlement.amount).toFixed(2)}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Settlements;
