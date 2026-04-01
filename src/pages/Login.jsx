import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAdminAuth } from '../context/AdminAuthContext';

export default function Login() {
  const { login, isAdmin, loading } = useAdminAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/';
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && isAdmin) navigate(from, { replace: true });
  }, [loading, isAdmin, navigate, from]);

  const onSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await login({ email, password });
      toast.success('Welcome, admin');
      navigate(from, { replace: true });
    } catch (err) {
      const msg =
        err.code === 'ERR_NETWORK' || err.message === 'Network Error'
          ? 'Network error: cannot reach API. Check internet and VITE_API_URL=https://drserver.vercel.app/api, then restart admin dev server.'
          : err.response?.data?.message || err.message || 'Login failed';
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-[100dvh] min-h-screen items-center justify-center px-4 py-8 sm:px-6">
      <form
        onSubmit={onSubmit}
        className="w-full max-w-sm space-y-4 rounded-2xl border border-zinc-800 bg-surface-card p-6 sm:p-8"
      >
        <h1 className="text-center text-xl font-bold text-amber-400">Admin login</h1>
        <input
          type="text"
          required
          autoComplete="username"
          inputMode="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="admin@mahadev.local"
          className="w-full rounded-lg border border-zinc-700 bg-black/40 px-4 py-3 text-white outline-none focus:border-amber-500"
        />
        <input
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          className="w-full rounded-lg border border-zinc-700 bg-black/40 px-4 py-3 text-white outline-none focus:border-amber-500"
        />
        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-lg bg-amber-500 py-3 font-semibold text-black hover:bg-amber-400 disabled:opacity-50"
        >
          {submitting ? '…' : 'Sign in'}
        </button>
      </form>
    </div>
  );
}
