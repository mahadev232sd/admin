import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Users, Gamepad2, ArrowDownCircle, ArrowUpCircle } from 'lucide-react';
import api from '../api/client';

export default function Dashboard() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    api
      .get('/admin/stats')
      .then((r) => setStats(r.data))
      .catch(() => toast.error('Failed to load stats'));
  }, []);

  if (!stats) {
    return (
      <div className="flex justify-center py-20">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-amber-500 border-t-transparent" />
      </div>
    );
  }

  const cards = [
    { label: 'Users', value: stats.users, icon: Users },
    { label: 'Game IDs', value: stats.gameIds, icon: Gamepad2 },
    { label: 'Pending deposits', value: stats.pendingDeposits, icon: ArrowDownCircle },
    { label: 'Pending withdrawals', value: stats.pendingWithdraws, icon: ArrowUpCircle },
  ];

  return (
    <div>
      <h1 className="mb-2 text-2xl font-bold text-white">Overview</h1>
      <p className="mb-6 text-sm text-zinc-500">
        Manage deposits, withdrawals, game IDs, and users from the sidebar.
      </p>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map(({ label, value, icon: Icon }) => (
          <div
            key={label}
            className="rounded-xl border border-zinc-800 bg-surface-card p-5 shadow-lg"
          >
            <div className="flex items-center justify-between">
              <p className="text-sm text-zinc-500">{label}</p>
              <Icon className="h-5 w-5 text-amber-500/80" />
            </div>
            <p className="mt-2 text-3xl font-bold text-white">{value}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Link
          to="/transactions"
          className="rounded-xl border border-zinc-700 bg-zinc-900/50 px-4 py-3 text-sm font-medium text-white transition hover:border-amber-500/40 hover:bg-zinc-800"
        >
          Deposits & withdrawals →
        </Link>
        <Link
          to="/game-ids"
          className="rounded-xl border border-zinc-700 bg-zinc-900/50 px-4 py-3 text-sm font-medium text-white transition hover:border-amber-500/40 hover:bg-zinc-800"
        >
          Game IDs →
        </Link>
        <Link
          to="/users"
          className="rounded-xl border border-zinc-700 bg-zinc-900/50 px-4 py-3 text-sm font-medium text-white transition hover:border-amber-500/40 hover:bg-zinc-800"
        >
          Users →
        </Link>
        <Link
          to="/transactions"
          className="rounded-xl border border-emerald-900/50 bg-emerald-950/30 px-4 py-3 text-sm font-medium text-emerald-300 transition hover:bg-emerald-950/50"
        >
          Pending approvals (transactions)
        </Link>
      </div>
    </div>
  );
}
