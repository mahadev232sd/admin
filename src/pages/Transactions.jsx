import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import api from '../api/client';

/** Deposit proof paths are `/uploads/...` on the API host (not under `/api`). */
function resolveUploadUrl(path) {
  if (!path) return '';
  if (path.startsWith('http')) return path;
  const apiBase = import.meta.env.VITE_API_URL?.trim();
  if (apiBase) {
    const origin = apiBase.replace(/\/api\/?$/, '');
    return `${origin}${path}`;
  }
  return path;
}

export default function Transactions() {
  const [list, setList] = useState([]);
  const [filter, setFilter] = useState({ status: 'pending' });

  const load = () => {
    const params = { status: filter.status };
    if (filter.type) params.type = filter.type;
    api
      .get('/admin/transactions', { params })
      .then((r) => setList(r.data.transactions || []))
      .catch(() => toast.error('Failed to load'));
  };

  useEffect(() => {
    load();
  }, [filter.status, filter.type]);

  const approve = async (id) => {
    try {
      await api.post(`/admin/transactions/${id}/approve`);
      toast.success('Approved');
      load();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed');
    }
  };

  const reject = async (id) => {
    try {
      await api.post(`/admin/transactions/${id}/reject`);
      toast.success('Rejected');
      load();
    } catch {
      toast.error('Failed');
    }
  };

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-white">Transactions</h1>
      <div className="mb-4 flex flex-wrap gap-2">
        {['pending', 'approved', 'rejected'].map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setFilter((f) => ({ ...f, status: s }))}
            className={`rounded-full px-4 py-1.5 text-sm capitalize ${
              filter.status === s ? 'bg-amber-500 text-black' : 'bg-zinc-800 text-zinc-400'
            }`}
          >
            {s}
          </button>
        ))}
        <select
          value={filter.type || ''}
          onChange={(e) =>
            setFilter((f) => ({ ...f, type: e.target.value || undefined }))
          }
          className="rounded-full border border-zinc-700 bg-zinc-900 px-3 py-1.5 text-sm"
        >
          <option value="">All types</option>
          <option value="deposit">Deposit</option>
          <option value="withdraw">Withdraw</option>
        </select>
      </div>
      <div className="space-y-3">
        {list.map((tx) => (
          <div
            key={tx._id}
            className="flex flex-col gap-3 rounded-xl border border-zinc-800 bg-surface-card p-4 md:flex-row md:items-center md:justify-between"
          >
            <div>
              <p className="font-semibold capitalize text-white">
                {tx.type} — ₹{tx.amount}
              </p>
              <p className="text-sm text-zinc-500">
                {tx.userId?.name} ({tx.userId?.email || tx.userId?.phone})
              </p>
              {tx.paymentMethod && (
                <p className="text-xs text-zinc-400">
                  Method: <span className="text-zinc-300">{tx.paymentMethod}</span>
                </p>
              )}
              {tx.type === 'withdraw' && tx.bankAccountId && (
                <p className="text-xs text-zinc-500">
                  Bank: {tx.bankAccountId.bankName} · ····
                  {String(tx.bankAccountId.accountNumber || '').slice(-4) || '—'}
                </p>
              )}
              {tx.type === 'deposit' && tx.referenceCode && (
                <p className="text-xs text-zinc-400">Ref: {tx.referenceCode}</p>
              )}
              {tx.utr && (
                <p className="text-xs text-zinc-400">UTR: {tx.utr}</p>
              )}
              {tx.proofImage && (
                <a
                  href={resolveUploadUrl(tx.proofImage)}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-amber-400 hover:underline"
                >
                  View payment proof
                </a>
              )}
              <p className="text-xs text-zinc-600">
                {new Date(tx.createdAt).toLocaleString()} · {tx.status}
              </p>
            </div>
            {tx.status === 'pending' && (
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => approve(tx._id)}
                  className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white"
                >
                  Approve
                </button>
                <button
                  type="button"
                  onClick={() => reject(tx._id)}
                  className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white"
                >
                  Reject
                </button>
              </div>
            )}
          </div>
        ))}
        {list.length === 0 && <p className="text-zinc-500">No transactions.</p>}
      </div>
    </div>
  );
}
