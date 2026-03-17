import React, { useState } from 'react';
import { createGroup, type Group } from '../services/groupServices';


const Icon = ({ path, className = 'size-5' }: { path: string; className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
    strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d={path} />
  </svg>
);

const ICONS = {
  close: 'M6 18 18 6M6 6l12 12',
};

interface CreateGroupModalProps {
  open: boolean;
  onClose: () => void;
  onCreated: (group: Group) => void;
}

const CreateGroupModal = ({ open, onClose, onCreated }: CreateGroupModalProps) => {
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!name.trim()) { setError('Group name is required.'); return; }

    setLoading(true);
    try {
      const group = await createGroup(name.trim());
      onCreated(group);
      setName('');
      onClose();
    } catch (err: any) {
      setError(err?.response?.data?.error || err?.response?.data?.message || 'Failed to create group.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ animation: 'backdropIn 0.2s ease both' }}>
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full max-w-md bg-white dark:bg-gray-900 rounded-[2rem] shadow-2xl shadow-violet-500/10 border border-gray-100 dark:border-gray-800 p-8"
        style={{ animation: 'modalIn 0.35s cubic-bezier(0.16,1,0.3,1) both' }}>

        {/* Close button */}
        <button onClick={onClose}
          className="absolute top-6 right-6 w-9 h-9 rounded-xl flex items-center justify-center text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all cursor-pointer">
          <Icon path={ICONS.close} className="size-5" />
        </button>

        <div className="mb-8">
          <h3 className="text-xl font-black text-gray-900 dark:text-white mb-2">Create New Group</h3>
          <p className="text-sm text-gray-400 dark:text-gray-500 leading-relaxed">Organize your expenses into a shared circle for your team or trip.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label htmlFor="group-name" className="block text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-[0.15em] ml-1">
              Group Name
            </label>
            <input
              id="group-name"
              type="text"
              value={name}
              onChange={(e) => { setName(e.target.value); setError(''); }}
              placeholder="e.g. Barcelona Trip"
              autoFocus
              className="w-full px-5 py-4 rounded-2xl border border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/50 text-sm font-semibold text-gray-800 dark:text-gray-100 placeholder-gray-300 dark:placeholder-gray-600 focus:outline-none focus:ring-4 focus:ring-violet-500/10 focus:border-violet-500 transition-all shadow-sm"
            />
          </div>

          {error && (
            <p className="px-4 py-3 bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/20 text-xs text-rose-500 font-bold rounded-xl animate-[popIn_0.2s_ease-out]">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading || !name.trim()}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-sm font-bold shadow-xl shadow-violet-500/30 hover:opacity-95 hover:-translate-y-px active:translate-y-0 disabled:opacity-50 disabled:translate-y-0 transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            {loading ? (
              <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              'Create Circle'
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateGroupModal;
