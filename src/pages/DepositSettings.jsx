import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import api from '../api/client';

export default function DepositSettings() {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [qrFile, setQrFile] = useState(null);
  const [form, setForm] = useState({
    upiId: '',
    payeeName: '',
    accountNumber: '',
    ifsc: '',
    bankName: '',
    accountHolder: '',
    qrImageUrl: '',
  });

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/admin/deposit-payment');
      const c = data.config || {};
      setForm({
        upiId: c.upiId || '',
        payeeName: c.payeeName || '',
        accountNumber: c.accountNumber || '',
        ifsc: c.ifsc || '',
        bankName: c.bankName || '',
        accountHolder: c.accountHolder || '',
        qrImageUrl: c.qrImageUrl || '',
      });
    } catch {
      toast.error('Failed to load deposit settings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const onSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => {
        if (k === 'qrImageUrl') return;
        fd.append(k, v);
      });
      if (qrFile) fd.append('qrImage', qrFile);
      const { data } = await api.put('/admin/deposit-payment', fd);
      const c = data.config || {};
      setForm((prev) => ({ ...prev, qrImageUrl: c.qrImageUrl || prev.qrImageUrl }));
      setQrFile(null);
      toast.success('Saved');
    } catch (e2) {
      toast.error(e2.response?.data?.message || e2.response?.data?.errors?.[0]?.msg || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <h1 className="mb-2 text-2xl font-bold text-white">Deposit Settings</h1>
      <p className="mb-6 text-sm text-zinc-500">Update UPI details and optional QR image shown to users.</p>

      <form
        onSubmit={onSave}
        className="rounded-xl border border-zinc-800 bg-surface-card p-4 md:p-5"
      >
        {loading ? (
          <p className="text-sm text-zinc-400">Loading…</p>
        ) : (
          <div className="grid gap-3 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs text-zinc-500">UPI ID</label>
              <input
                value={form.upiId}
                onChange={(e) => setForm((f) => ({ ...f, upiId: e.target.value }))}
                className="w-full rounded-lg border border-zinc-700 bg-black/40 px-3 py-2 text-sm text-white outline-none focus:border-amber-500"
                placeholder="merchant@upi"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-zinc-500">Payee name</label>
              <input
                value={form.payeeName}
                onChange={(e) => setForm((f) => ({ ...f, payeeName: e.target.value }))}
                className="w-full rounded-lg border border-zinc-700 bg-black/40 px-3 py-2 text-sm text-white outline-none focus:border-amber-500"
                placeholder="Mahadev"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-zinc-500">Bank name</label>
              <input
                value={form.bankName}
                onChange={(e) => setForm((f) => ({ ...f, bankName: e.target.value }))}
                className="w-full rounded-lg border border-zinc-700 bg-black/40 px-3 py-2 text-sm text-white outline-none focus:border-amber-500"
                placeholder="Bank name"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-zinc-500">Account holder</label>
              <input
                value={form.accountHolder}
                onChange={(e) => setForm((f) => ({ ...f, accountHolder: e.target.value }))}
                className="w-full rounded-lg border border-zinc-700 bg-black/40 px-3 py-2 text-sm text-white outline-none focus:border-amber-500"
                placeholder="Account holder"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-zinc-500">Account number</label>
              <input
                value={form.accountNumber}
                onChange={(e) => setForm((f) => ({ ...f, accountNumber: e.target.value }))}
                className="w-full rounded-lg border border-zinc-700 bg-black/40 px-3 py-2 text-sm text-white outline-none focus:border-amber-500"
                placeholder="Account number"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-zinc-500">IFSC</label>
              <input
                value={form.ifsc}
                onChange={(e) => setForm((f) => ({ ...f, ifsc: e.target.value }))}
                className="w-full rounded-lg border border-zinc-700 bg-black/40 px-3 py-2 text-sm text-white outline-none focus:border-amber-500"
                placeholder="IFSC"
              />
            </div>

            <div className="md:col-span-2">
              <label className="mb-1 block text-xs text-zinc-500">QR image (optional)</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setQrFile(e.target.files?.[0] || null)}
                className="w-full rounded-lg border border-zinc-700 bg-black/40 px-3 py-2 text-xs text-zinc-200"
              />
              {form.qrImageUrl && (
                <a
                  href={form.qrImageUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-2 inline-block text-xs text-amber-400 hover:underline"
                >
                  View current QR image
                </a>
              )}
            </div>
          </div>
        )}

        <div className="mt-5 flex items-center gap-2">
          <button
            type="submit"
            disabled={saving || loading}
            className="rounded-lg bg-amber-500 px-4 py-2 text-sm font-semibold text-black hover:bg-amber-400 disabled:opacity-50"
          >
            {saving ? 'Saving…' : 'Save'}
          </button>
          <button
            type="button"
            onClick={load}
            disabled={saving}
            className="rounded-lg border border-zinc-700 px-4 py-2 text-sm text-zinc-200 hover:bg-zinc-900 disabled:opacity-50"
          >
            Refresh
          </button>
        </div>
      </form>
    </div>
  );
}

