import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../api/client';

export default function UserDetail() {
  const { id } = useParams();
  const [user, setUser] = useState(null);
  const [gameIds, setGameIds] = useState([]);
  const [wallet, setWallet] = useState('');
  const [newPass, setNewPass] = useState('');
  const [platforms, setPlatforms] = useState([]);
  const [newPlat, setNewPlat] = useState('');
  const [creatingId, setCreatingId] = useState(false);

  const load = () => {
    Promise.all([api.get(`/admin/users/${id}`), api.get(`/admin/users/${id}/game-ids`)])
      .then(([uRes, gRes]) => {
        setUser(uRes.data.user);
        setWallet(String(uRes.data.user.walletBalance));
        setGameIds(gRes.data.gameIds || []);
      })
      .catch(() => toast.error('Failed to load user'));
  };

  useEffect(() => {
    load();
  }, [id]);

  const saveWallet = async (e) => {
    e.preventDefault();
    try {
      await api.patch(`/admin/users/${id}/wallet`, { walletBalance: Number(wallet) });
      toast.success('Wallet updated');
      load();
    } catch {
      toast.error('Update failed');
    }
  };

  const resetUserPassword = async (e) => {
    e.preventDefault();
    if (newPass.length < 6) {
      toast.error('Password min 6 chars');
      return;
    }
    try {
      await api.post(`/admin/users/${id}/reset-password`, { newPassword: newPass });
      toast.success('User password updated');
      setNewPass('');
    } catch {
      toast.error('Failed');
    }
  };

  const createGameId = async (e) => {
    e.preventDefault();
    if (!newPlat) {
      toast.error('Select a platform');
      return;
    }
    setCreatingId(true);
    try {
      await api.post(`/admin/users/${id}/game-ids`, { platformName: newPlat });
      toast.success('Game ID created');
      setNewPlat('');
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    } finally {
      setCreatingId(false);
    }
  };

  const toggleIdStatus = async (gid, status) => {
    try {
      await api.patch(`/admin/game-ids/${gid}/status`, { status });
      toast.success('ID status updated');
      load();
    } catch {
      toast.error('Failed');
    }
  };

  if (!user) {
    return (
      <div className="flex justify-center py-20">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-amber-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div>
      <Link to="/users" className="mb-4 inline-block text-sm text-amber-400 hover:underline">
        ← Users
      </Link>
      <h1 className="mb-2 text-2xl font-bold text-white">{user.name}</h1>
      <p className="mb-6 text-zinc-500">{user.email || user.phone}</p>

      <div className="mb-8 grid gap-6 md:grid-cols-2">
        <form onSubmit={saveWallet} className="rounded-xl border border-zinc-800 bg-surface-card p-5">
          <h2 className="mb-3 font-semibold text-white">Wallet balance</h2>
          <input
            type="number"
            min="0"
            value={wallet}
            onChange={(e) => setWallet(e.target.value)}
            className="mb-3 w-full rounded-lg border border-zinc-700 bg-black/40 px-3 py-2 text-white"
          />
          <button type="submit" className="rounded-lg bg-amber-500 px-4 py-2 text-sm font-semibold text-black">
            Save balance
          </button>
        </form>
        <form onSubmit={resetUserPassword} className="rounded-xl border border-zinc-800 bg-surface-card p-5">
          <h2 className="mb-3 font-semibold text-white">Reset user login password</h2>
          <input
            type="password"
            value={newPass}
            onChange={(e) => setNewPass(e.target.value)}
            placeholder="New password"
            className="mb-3 w-full rounded-lg border border-zinc-700 bg-black/40 px-3 py-2 text-white"
          />
          <button type="submit" className="rounded-lg border border-zinc-600 px-4 py-2 text-sm text-white hover:bg-zinc-800">
            Reset password
          </button>
        </form>
      </div>

      <h2 className="mb-3 text-lg font-semibold text-white">Game IDs</h2>
      <form
        onSubmit={createGameId}
        className="mb-6 flex flex-wrap items-end gap-3 rounded-xl border border-zinc-800 bg-zinc-900/30 p-4"
      >
        <div className="min-w-[200px] flex-1">
          <label className="mb-1 block text-xs text-zinc-500">Create new ID (platform)</label>
          <select
            value={newPlat}
            onChange={(e) => setNewPlat(e.target.value)}
            className="w-full rounded-lg border border-zinc-700 bg-black/40 px-3 py-2 text-sm text-white"
          >
            <option value="">Select platform</option>
            {platforms.map((p) => (
              <option key={p.name} value={p.name}>
                {p.name}
              </option>
            ))}
          </select>
        </div>
        <button
          type="submit"
          disabled={creatingId}
          className="rounded-lg bg-amber-500 px-4 py-2 text-sm font-semibold text-black hover:bg-amber-400 disabled:opacity-50"
        >
          {creatingId ? 'Creating…' : 'Create game ID'}
        </button>
      </form>
      <div className="space-y-2">
        {gameIds.length === 0 && <p className="text-zinc-500">None yet.</p>}
        {gameIds.map((g) => (
          <div
            key={g._id}
            className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-zinc-800 bg-zinc-900/40 px-4 py-3"
          >
            <div>
              <p className="font-medium text-white">{g.platformName}</p>
              <p className="font-mono text-xs text-zinc-500">{g.uniqueId}</p>
            </div>
            <div className="flex gap-2">
              <span
                className={`rounded-full px-2 py-0.5 text-xs ${
                  g.status === 'active' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-zinc-600 text-zinc-300'
                }`}
              >
                {g.status}
              </span>
              <button
                type="button"
                onClick={() => toggleIdStatus(g._id, g.status === 'active' ? 'inactive' : 'active')}
                className="text-xs text-amber-400 hover:underline"
              >
                Toggle
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
