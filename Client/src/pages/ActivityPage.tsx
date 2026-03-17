import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import Header from '../components/Header.tsx';
import { getDashboardData, type DashboardData } from '../services/userServices';

const Icon = ({ path, className = 'size-5' }: { path: string; className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
    strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d={path} />
  </svg>
);

const ICONS = {
  add: 'M12 4.5v15m7.5-7.5h-15',
  settle: 'M7.5 21 3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5',
  empty: 'M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z',
  groups: 'M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z',
};

const ActivityPage = () => {
  const { user } = useAuth();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      try {
        const dashboardData = await getDashboardData();
        setData(dashboardData);
      } catch (err: any) {
        if (err?.response?.status === 401) return; // Silent 401
        console.error('Failed to fetch activity:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user]);

  const groupedTasks = () => {
    if (!data) return {};
    const groups: { [key: string]: typeof data.recentActivity } = {};
    data.recentActivity.forEach(activity => {
      const name = activity.group_name;
      if (!groups[name]) groups[name] = [];
      groups[name].push(activity);
    });
    return groups;
  };

  const activityByGroup = groupedTasks();

  return (
    <div className="min-h-screen bg-gray-50/60 dark:bg-gray-950 flex flex-col font-sans transition-colors duration-300">
      <Header />

      <main className="flex-1 w-full max-w-5xl xl:max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="mb-8" style={{ animation: 'fadeUp 0.5s cubic-bezier(0.16,1,0.3,1) both' }}>
          <h1 className="text-3xl font-black text-gray-900 dark:text-white transition-colors">Activity History</h1>
          <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Every transaction across all your expense circles.</p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 animate-pulse">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-64 bg-gray-100 dark:bg-gray-800 rounded-[2.5rem]" />
            ))}
          </div>
        ) : Object.keys(activityByGroup).length === 0 ? (
          <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-[2.5rem] p-16 text-center shadow-sm">
            <div className="w-20 h-20 mx-auto mb-6 rounded-3xl bg-gray-50 dark:bg-gray-800 flex items-center justify-center text-gray-300 dark:text-gray-600">
              <Icon path={ICONS.empty} className="size-10" />
            </div>
            <h3 className="text-xl font-extrabold text-gray-900 dark:text-white mb-2">No Activities yet</h3>
            <p className="text-gray-400 dark:text-gray-500 max-w-xs mx-auto">Activities will appear here once you start splitting expenses in your groups.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 items-start">
            {Object.entries(activityByGroup).map(([groupName, activities], idx) => (
              <div
                key={groupName}
                className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-[2.5rem] overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300"
                style={{ animation: `fadeUp 0.5s cubic-bezier(0.16,1,0.3,1) ${idx * 0.1}s both` }}
              >
                {/* Group Box Header */}
                <div className="px-6 py-5 bg-gradient-to-r from-violet-600/5 to-indigo-600/5 dark:from-violet-900/10 dark:to-indigo-900/10 border-b border-gray-50 dark:border-gray-800 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white dark:bg-gray-800 shadow-sm flex items-center justify-center text-violet-600 dark:text-violet-400">
                    <Icon path={ICONS.groups} className="size-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-gray-900 dark:text-gray-100 transition-colors uppercase">{groupName}</h3>
                    <p className="text-[10px] uppercase tracking-widest font-bold text-gray-400 dark:text-gray-500">{activities.length} recent events</p>
                  </div>
                </div>

                {/* Activity List in this group */}
                <div className="p-2">
                  <div className="space-y-1">
                    {activities.map((a, i) => (
                      <div
                        key={`${a.type}-${i}`}
                        className="flex items-center gap-4 px-4 py-3.5 hover:bg-gray-50/50 rounded-2xl transition-colors group"
                      >
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-110 ${a.type === 'expense' 
                          ? 'bg-violet-50 dark:bg-violet-900/20 text-violet-500 dark:text-violet-400' 
                          : 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-500 dark:text-emerald-400'
                          }`}>
                          <Icon path={a.type === 'expense' ? ICONS.add : ICONS.settle} className="size-4" />
                        </div>

                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-extrabold text-gray-900 dark:text-gray-100 truncate">{a.title}</p>
                          <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5">
                            <span className="font-bold text-gray-700 dark:text-gray-300">{a.paid_by_id === user?.id ? 'You' : a.paid_by_username}</span>
                            {a.type === 'expense' ? ' paid' : ' settled'}
                          </p>
                        </div>

                        <div className="text-right">
                          <p className={`text-sm font-black ${a.type === 'settlement' ? 'text-emerald-500' : 'text-gray-900 dark:text-gray-100'
                            }`}>${a.amount.toFixed(2)}</p>
                          <p className="text-[9px] font-bold text-gray-400 mt-0.5 uppercase tracking-widest">
                            {new Date(a.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default ActivityPage;
