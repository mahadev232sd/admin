import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../api/client';

export default function Users() {
  const [data, setData] = useState({ users: [], total: 0 });
  const [page, setPage] = useState(1);

  useEffect(() => {
    api
      .get('/admin/users', { params: { page, limit: 20 } })
      .then((r) => setData({ users: r.data.users, total: r.data.total }))
      .catch(() => toast.error('Failed to load users'));
  }, [page]);

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-white">Users</h1>
      <div className="overflow-x-auto rounded-xl border border-zinc-800">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-zinc-800 bg-zinc-900/50 text-zinc-400">
            <tr>
              <th className="p-3">Name</th>
              <th className="p-3">Contact</th>
              <th className="p-3">Wallet</th>
              <th className="p-3"></th>
            </tr>
          </thead>
          <tbody>
            {data.users.map((u) => (
              <tr key={u._id} className="border-b border-zinc-800/80 hover:bg-zinc-900/30">
                <td className="p-3 font-medium text-white">{u.name}</td>
                <td className="p-3 text-zinc-400">{u.email || u.phone}</td>
                <td className="p-3">₹{u.walletBalance}</td>
                <td className="p-3">
                  <Link to={`/users/${u._id}`} className="text-amber-400 hover:underline">
                    Manage
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-4 flex items-center justify-between text-sm text-zinc-500">
        <span>
          Page {page} — {data.total} total
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
            disabled={page * 20 >= data.total}
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
