import { useEffect, useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api/client';

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
  const [payoutFiles, setPayoutFiles] = useState({});
  const [expanded, setExpanded] = useState(null);

  const load = () => {
    const params = { status: filter.status };
    if (filter.type) params.type = filter.type;
    api
      .get('/admin/transactions', { params })
      .then((r) => setList(r.data.transactions || []))
      .catch(() => toast.error('Failed to load'));
  };

  useEffect(() => { load(); }, [filter.status, filter.type]);

  const toggle = (id) => setExpanded((prev) => (prev === id ? null : id));

  const approve = async (id) => {
    try {
      const tx = list.find((t) => t._id === id);
      const f = payoutFiles[id];
      if (tx?.type === 'withdraw' && f) {
        const fd = new FormData();
        fd.append('proof', f);
        await api.post(`/admin/transactions/${id}/approve`, fd);
      } else {
        await api.post(`/admin/transactions/${id}/approve`);
      }
      toast.success('Approved');
      setPayoutFiles((m) => { const next = { ...m }; delete next[id]; return next; });
      setExpanded(null);
      load();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed');
    }
  };

  const reject = async (id) => {
    try {
      await api.post(`/admin/transactions/${id}/reject`);
      toast.success('Rejected');
      setExpanded(null);
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
          onChange={(e) => setFilter((f) => ({ ...f, type: e.target.value || undefined }))}
          className="rounded-full border border-zinc-700 bg-zinc-900 px-3 py-1.5 text-sm text-white"
        >
          <option value="">All types</option>
          <option value="deposit">Deposit</option>
          <option value="withdraw">Withdraw</option>
        </select>
      </div>

      <div className="space-y-3">
        {list.map((tx) => {
          const isOpen = expanded === tx._id;
          const bank = tx.bankAccountId;
          return (
            <div
              key={tx._id}
              className="rounded-xl border border-zinc-800 bg-surface-card overflow-hidden"
            >
              {/* ── Summary row (always visible, clickable) ── */}
              <button
                type="button"
                onClick={() => toggle(tx._id)}
                className="flex w-full items-center justify-between gap-3 p-4 text-left"
              >
                <div className="min-w-0">
                  <p className="font-semibold capitalize text-white">
                    {tx.type} — ₹{tx.amount}
                    <span
                      className={`ml-2 rounded-full px-2 py-0.5 text-[10px] font-medium ${
                        tx.status === 'pending'
                          ? 'bg-amber-500/20 text-amber-300'
                          : tx.status === 'approved'
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : 'bg-red-500/20 text-red-400'
                      }`}
                    >
                      {tx.status}
                    </span>
                  </p>
                  <p className="truncate text-sm text-zinc-400">
                    {tx.userId?.name} · {tx.userId?.phone || tx.userId?.email}
                  </p>
                  <p className="text-xs text-zinc-600">
                    {new Date(tx.createdAt).toLocaleString()}
                  </p>
                </div>
                {isOpen ? (
                  <ChevronUp className="h-5 w-5 shrink-0 text-zinc-400" />
                ) : (
                  <ChevronDown className="h-5 w-5 shrink-0 text-zinc-400" />
                )}
              </button>

              {/* ── Expanded details ── */}
              {isOpen && (
                <div className="border-t border-zinc-800 px-4 pb-4 pt-3 space-y-3">
                  {/* User info */}
                  <div className="rounded-lg bg-zinc-900 p-3 space-y-1 text-sm">
                    <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500 mb-1">User Details</p>
                    <Row label="Name" value={tx.userId?.name} />
                    <Row label="Phone" value={tx.userId?.phone} />
                    <Row label="Email" value={tx.userId?.email} />
                  </div>

                  {/* Bank / payment details */}
                  {tx.type === 'withdraw' && bank && (
                    <div className="rounded-lg bg-zinc-900 p-3 space-y-1 text-sm">
                      <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500 mb-1">Bank Details</p>
                      <Row label="Account Holder" value={bank.accountHolderName} />
                      <Row label="Bank" value={bank.bankName} />
                      <Row label="Account No." value={bank.accountNumber} />
                      <Row label="IFSC" value={bank.ifscCode} />
                      <Row label="UPI ID" value={bank.upiId} />
                    </div>
                  )}

                  {tx.type === 'deposit' && (
                    <div className="rounded-lg bg-zinc-900 p-3 space-y-1 text-sm">
                      <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500 mb-1">Deposit Details</p>
                      {tx.paymentMethod && <Row label="Method" value={tx.paymentMethod} />}
                      {tx.referenceCode && <Row label="Ref Code" value={tx.referenceCode} />}
                      {tx.utr && <Row label="UTR" value={tx.utr} />}
                    </div>
                  )}

                  {/* Proofs */}
                  {tx.proofImage && (
                    <a
                      href={resolveUploadUrl(tx.proofImage)}
                      target="_blank"
                      rel="noreferrer"
                      className="block text-sm text-amber-400 hover:underline"
                    >
                      View payment proof ↗
                    </a>
                  )}
                  {tx.payoutProofImage && (
                    <a
                      href={resolveUploadUrl(tx.payoutProofImage)}
                      target="_blank"
                      rel="noreferrer"
                      className="block text-sm text-emerald-400 hover:underline"
                    >
                      View payout proof ↗
                    </a>
                  )}

                  {/* Actions for pending */}
                  {tx.status === 'pending' && (
                    <div className="space-y-2 pt-1">
                      {tx.type === 'withdraw' && (
                        <div>
                          <label className="mb-1 block text-xs text-zinc-500">
                            Upload payout screenshot (optional)
                          </label>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                              const file = e.target.files?.[0] || null;
                              setPayoutFiles((m) => ({ ...m, [tx._id]: file || undefined }));
                            }}
                            className="w-full rounded-lg border border-zinc-700 bg-black/40 px-3 py-2 text-xs text-zinc-200"
                          />
                        </div>
                      )}
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => approve(tx._id)}
                          className="flex-1 rounded-lg bg-emerald-600 py-2 text-sm font-medium text-white hover:bg-emerald-500"
                        >
                          Approve
                        </button>
                        <button
                          type="button"
                          onClick={() => reject(tx._id)}
                          className="flex-1 rounded-lg bg-red-600 py-2 text-sm font-medium text-white hover:bg-red-500"
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
        {list.length === 0 && <p className="text-zinc-500">No transactions.</p>}
      </div>
    </div>
  );
}

function Row({ label, value }) {
  if (!value) return null;
  return (
    <div className="flex justify-between gap-2">
      <span className="text-zinc-500">{label}</span>
      <span className="text-right text-zinc-200 break-all">{value}</span>
    </div>
  );
}
