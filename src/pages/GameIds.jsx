import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { Eye, EyeOff } from 'lucide-react';
import api from '../api/client';

export default function GameIds() {
  const [rows, setRows] = useState([]);
  const [page, setPage] = useState(1);
  const [approvalFilter, setApprovalFilter] = useState('');
  const [total, setTotal] = useState(0);
  const [platforms, setPlatforms] = useState([]);
  const [userList, setUserList] = useState([]);
  const [createUserId, setCreateUserId] = useState('');
  const [createPlatform, setCreatePlatform] = useState('');
  const [creating, setCreating] = useState(false);
  const [showPw, setShowPw] = useState({});
  const [pendingCreds, setPendingCreds] = useState({});

  const sortedRows = useMemo(() => {
    if (approvalFilter) return rows;
    const list = [...rows];
    list.sort((a, b) => {
      const pa = a.approvalStatus === 'pending' ? 0 : 1;
      const pb = b.approvalStatus === 'pending' ? 0 : 1;
      if (pa !== pb) return pa - pb;
      return new Date(b.createdAt) - new Date(a.createdAt);
    });
    return list;
  }, [rows, approvalFilter]);

  const load = () => {
    const params = { page, limit: 30 };
    if (approvalFilter) params.approvalStatus = approvalFilter;
    api
      .get('/admin/game-ids', { params })
      .then((r) => {
        setRows(r.data.gameIds);
        setTotal(r.data.total);
      })
      .catch(() => toast.error('Failed to load'));
  };

  useEffect(() => {
    load();
  }, [page, approvalFilter]);

  useEffect(() => {
    api
      .get('/admin/platforms')
      .then((r) => setPlatforms(r.data.platforms || []))
      .catch(() => {});
    api
      .get('/admin/users', { params: { page: 1, limit: 200 } })
      .then((r) => setUserList(r.data.users || []))
      .catch(() => {});
  }, []);

  const createForUser = async (e) => {
    e.preventDefault();
    if (!createUserId || !createPlatform) {
      toast.error('Select user and platform');
      return;
    }
    setCreating(true);
    try {
      await api.post(`/admin/users/${createUserId}/game-ids`, { platformName: createPlatform });
      toast.success('Game ID created');
      setCreatePlatform('');
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create');
    } finally {
      setCreating(false);
    }
  };

  const toggle = async (id, status) => {
    try {
      await api.patch(`/admin/game-ids/${id}/status`, { status });
      toast.success('Updated');
      load();
    } catch {
      toast.error('Failed — approve the ID first if it was user-requested');
    }
  };

  const approve = async (id) => {
    const creds = pendingCreds[id] || {};
    const uniqueId = String(creds.uniqueId || '').trim();
    const password = String(creds.password || '').trim();
    if (!uniqueId || !password) {
      toast.error('Enter Gaming ID and Password for this pending request');
      return;
    }
    try {
      await api.post(`/admin/game-ids/${id}/approve`, { uniqueId, password });
      toast.success('Approved — user can see ID & password');
      setPendingCreds((m) => {
        const next = { ...m };
        delete next[id];
        return next;
      });
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || err.response?.data?.errors?.[0]?.msg || 'Failed');
    }
  };

  const reject = async (id) => {
    try {
      await api.post(`/admin/game-ids/${id}/reject`);
      toast.success('Rejected');
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    }
  };

  return (
    <div>
      <h1 className="mb-2 text-2xl font-bold text-white">Game IDs</h1>
      <p className="mb-6 text-sm text-zinc-500">
        User requests appear as <strong className="text-amber-400">pending</strong>. Approve after entering
        Gaming ID and Password. Reject to let the user submit again.
      </p>

      <form
        onSubmit={createForUser}
        className="mb-8 rounded-xl border border-zinc-800 bg-surface-card p-4 md:flex md:flex-wrap md:items-end md:gap-3"
      >
        <div className="mb-3 min-w-[200px] flex-1 md:mb-0">
          <label className="mb-1 block text-xs text-zinc-500">User</label>
          <select
            required
            value={createUserId}
            onChange={(e) => setCreateUserId(e.target.value)}
            className="w-full rounded-lg border border-zinc-700 bg-black/40 px-3 py-2 text-sm text-white"
          >
            <option value="">Select user</option>
            {userList.map((u) => (
              <option key={u._id} value={u._id}>
                {u.name} — {u.email || u.phone}
              </option>
            ))}
          </select>
        </div>
        <div className="mb-3 min-w-[180px] flex-1 md:mb-0">
          <label className="mb-1 block text-xs text-zinc-500">Platform</label>
          <select
            required
            value={createPlatform}
            onChange={(e) => setCreatePlatform(e.target.value)}
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
          disabled={creating}
          className="w-full rounded-lg bg-amber-500 px-4 py-2 text-sm font-semibold text-black hover:bg-amber-400 disabled:opacity-50 md:w-auto"
        >
          {creating ? 'Creating…' : 'Create game ID'}
        </button>
      </form>

      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <h2 className="text-lg font-semibold text-white">All game IDs</h2>
        <div className="flex flex-col gap-1">
          <label className="text-xs text-zinc-500">Approval</label>
          <select
            value={approvalFilter}
            onChange={(e) => {
              setApprovalFilter(e.target.value);
              setPage(1);
            }}
            className="min-w-[180px] rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-white"
          >
            <option value="">All</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>
      <div className="overflow-x-auto rounded-xl border border-zinc-800">
        <table className="w-full min-w-[820px] text-left text-sm">
          <thead className="border-b border-zinc-800 bg-zinc-900/50 text-zinc-400">
            <tr>
              <th className="p-3">User</th>
              <th className="p-3">Platform</th>
              <th className="p-3">Username</th>
              <th className="p-3">Approval</th>
              <th className="p-3">Unique ID</th>
              <th className="p-3">Password</th>
              <th className="p-3">Status</th>
              <th className="p-3"></th>
            </tr>
          </thead>
          <tbody>
            {sortedRows.map((g) => (
              <tr key={g._id} className="border-b border-zinc-800/80">
                <td className="p-3 text-zinc-300">
                  {g.userId?.name || '—'}
                  <br />
                  <span className="text-xs text-zinc-600">{g.userId?.email || g.userId?.phone}</span>
                </td>
                <td className="p-3 text-white">{g.platformName}</td>
                <td className="p-3 font-mono text-xs text-zinc-400">
                  {g.username || g.clientName || '—'}
                </td>
                <td className="p-3">
                  <span
                    className={
                      g.approvalStatus === 'pending'
                        ? 'text-amber-400'
                        : g.approvalStatus === 'rejected'
                          ? 'text-red-400'
                          : 'text-emerald-400'
                    }
                  >
                    {g.approvalStatus || 'approved'}
                  </span>
                </td>
                <td className="p-3 font-mono text-xs">
                  {g.approvalStatus === 'pending' ? (
                    <input
                      type="text"
                      value={pendingCreds[g._id]?.uniqueId || ''}
                      onChange={(e) =>
                        setPendingCreds((m) => ({
                          ...m,
                          [g._id]: { ...(m[g._id] || {}), uniqueId: e.target.value },
                        }))
                      }
                      placeholder="Enter gaming ID"
                      className="w-full rounded-lg border border-zinc-700 bg-black/40 px-3 py-1 text-xs text-white placeholder:text-zinc-600 outline-none focus:border-amber-400"
                    />
                  ) : (
                    g.uniqueId?.startsWith('pend-') ? '—' : g.uniqueId
                  )}
                </td>
                <td className="p-3">
                  {g.approvalStatus === 'pending' ? (
                    <input
                      type="password"
                      value={pendingCreds[g._id]?.password || ''}
                      onChange={(e) =>
                        setPendingCreds((m) => ({
                          ...m,
                          [g._id]: { ...(m[g._id] || {}), password: e.target.value },
                        }))
                      }
                      placeholder="Enter password"
                      className="w-full rounded-lg border border-zinc-700 bg-black/40 px-3 py-1 text-xs text-white placeholder:text-zinc-600 outline-none focus:border-amber-400"
                    />
                  ) : (
                    <div className="flex max-w-[140px] items-center gap-1">
                      <span className="min-w-0 flex-1 truncate font-mono text-xs text-zinc-300">
                        {!g.password ? '—' : showPw[g._id] ? g.password : '••••••••'}
                      </span>
                      {g.approvalStatus === 'approved' && g.password ? (
                        <button
                          type="button"
                          onClick={() => setShowPw((s) => ({ ...s, [g._id]: !s[g._id] }))}
                          className="shrink-0 text-amber-400 hover:text-amber-300"
                          title={showPw[g._id] ? 'Hide' : 'Show'}
                        >
                          {showPw[g._id] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      ) : null}
                    </div>
                  )}
                </td>
                <td className="p-3">
                  <span className={g.status === 'active' ? 'text-emerald-400' : 'text-zinc-500'}>
                    {g.status}
                  </span>
                </td>
                <td className="p-3 whitespace-nowrap">
                  {g.approvalStatus === 'pending' ? (
                    <div className="flex flex-col gap-1 sm:flex-row">
                      <button
                        type="button"
                        onClick={() => approve(g._id)}
                        disabled={
                          !String(pendingCreds[g._id]?.uniqueId || '').trim() ||
                          !String(pendingCreds[g._id]?.password || '').trim()
                        }
                        className="rounded bg-emerald-600 px-2 py-1 text-xs font-semibold text-white hover:bg-emerald-500 disabled:opacity-40 disabled:hover:bg-emerald-600"
                      >
                        Approve
                      </button>
                      <button
                        type="button"
                        onClick={() => reject(g._id)}
                        className="rounded bg-red-600 px-2 py-1 text-xs font-semibold text-white hover:bg-red-500"
                      >
                        Reject
                      </button>
                    </div>
                  ) : g.approvalStatus === 'approved' ? (
                    <button
                      type="button"
                      onClick={() => toggle(g._id, g.status === 'active' ? 'inactive' : 'active')}
                      className="text-amber-400 hover:underline"
                    >
                      Toggle
                    </button>
                  ) : (
                    <span className="text-zinc-600">—</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-4 flex justify-between text-sm text-zinc-500">
        <span>
          Page {page} / {Math.max(1, Math.ceil(total / 30))}
        </span>
        <div className="flex gap-2">
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
            className="rounded border border-zinc-700 px-3 py-1 disabled:opacity-40"
          >
            Prev
          </button>
          <button
            type="button"
            disabled={page * 30 >= total}
            onClick={() => setPage((p) => p + 1)}
            className="rounded border border-zinc-700 px-3 py-1 disabled:opacity-40"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
