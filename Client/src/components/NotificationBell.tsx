import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../hooks/useAuth';
import { getPendingInvitations, respondToInvitation, type Invitation } from '../services/invitationServices';

const NotificationBell = () => {
    const { user } = useAuth();
    const [invitations, setInvitations] = useState<Invitation[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const fetchInvitations = async () => {
        if (!user) return;
        try {
            const data = await getPendingInvitations();
            setInvitations(data);
        } catch (error: any) {
            if (error?.response?.status === 401) return; // Silent 401
            console.error('Error fetching invitations:', error);
        }
    };

    useEffect(() => {
        if (!user) {
            setInvitations([]);
            return;
        }

        fetchInvitations();
        // Poll every 30 seconds for new invites
        const interval = setInterval(fetchInvitations, 30000);
        return () => clearInterval(interval);
    }, [user]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleAction = async (id: string, action: 'accept' | 'reject') => {
        setLoading(true);
        try {
            await respondToInvitation(id, action);
            await fetchInvitations();
            // Optional: trigger a refresh of groups list if accepted
            if (action === 'accept') {
                window.dispatchEvent(new CustomEvent('groupAdded'));
            }
        } catch (error) {
            console.error(`Error ${action}ing invitation:`, error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 rounded-xl text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer group"
            >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 group-hover:scale-110 transition-transform">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0" />
                </svg>
                {invitations.length > 0 && (
                    <span className="absolute top-2 right-2 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center ring-2 ring-white dark:ring-gray-900">
                        {invitations.length}
                    </span>
                )}
            </button>

            {isOpen && (
                // TO (centered on mobile, right-aligned on desktop):
                <div className="fixed sm:absolute left-1/2 sm:left-auto -translate-x-1/2 sm:translate-x-0 right-auto sm:right-0 top-16 sm:top-auto sm:mt-2 w-[calc(100vw-2rem)] sm:w-80 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl shadow-2xl z-50 overflow-hidden transform origin-top transition-all animate-in fade-in zoom-in duration-200">
                    <div className="px-5 py-4 border-b border-gray-50 dark:border-gray-800 flex items-center justify-between">
                        <h3 className="font-bold text-gray-800 dark:text-gray-200 text-sm">Notifications</h3>
                        <span className="text-[10px] font-black uppercase tracking-widest text-indigo-500 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20 px-2 py-1 rounded-md">
                            {invitations.length} Pending
                        </span>
                    </div>

                    <div className="max-h-96 overflow-y-auto">
                        {invitations.length === 0 ? (
                            <div className="p-8 text-center">
                                <div className="w-12 h-12 bg-gray-50 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-3">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-gray-300 dark:text-gray-600">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0" />
                                    </svg>
                                </div>
                                <p className="text-xs text-gray-400 dark:text-gray-500 font-medium">No new invitations</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-gray-50 dark:divide-gray-800">
                                {invitations.map((invite) => (
                                    <div key={invite.id} className="p-4 hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors">
                                        <div className="flex items-start gap-3">
                                            <div className="w-9 h-9 rounded-full bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center flex-shrink-0 text-indigo-600 dark:text-indigo-400 font-bold text-xs">
                                                {invite.sender.username[0].toUpperCase()}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                                                    <span className="font-bold text-gray-900 dark:text-gray-100">{invite.sender.username}</span> invited you to join <span className="font-bold text-gray-900 dark:text-gray-100">{invite.groups.name}</span>
                                                </p>
                                                <div className="flex items-center gap-2 mt-3">
                                                    <button
                                                        onClick={() => handleAction(invite.id, 'accept')}
                                                        disabled={loading}
                                                        className="flex-1 py-1.5 bg-indigo-600 text-white text-[10px] font-black uppercase tracking-widest rounded-lg hover:opacity-90 transition-all disabled:opacity-50"
                                                    >
                                                        Accept
                                                    </button>
                                                    <button
                                                        onClick={() => handleAction(invite.id, 'reject')}
                                                        disabled={loading}
                                                        className="flex-1 py-1.5 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 text-[10px] font-black uppercase tracking-widest rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-all disabled:opacity-50"
                                                    >
                                                        Decline
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default NotificationBell;
