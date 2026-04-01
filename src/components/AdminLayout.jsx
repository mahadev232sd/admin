import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, Gamepad2, ArrowLeftRight, QrCode, LogOut, Menu, X } from 'lucide-react';
import { useAdminAuth } from '../context/AdminAuthContext';

const nav = [
  { to: '/', label: 'Overview', icon: LayoutDashboard, end: true },
  { to: '/users', label: 'Users', icon: Users },
  { to: '/game-ids', label: 'Game IDs', icon: Gamepad2 },
  { to: '/transactions', label: 'Transactions', icon: ArrowLeftRight },
  { to: '/deposit-settings', label: 'Deposit Settings', icon: QrCode },
];

function NavLinks({ onNavigate }) {
  return (
    <>
      {nav.map(({ to, label, icon: Icon, end }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          onClick={() => onNavigate?.()}
          className={({ isActive }) =>
            `flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm transition-colors ${
              isActive ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200'
            }`
          }
        >
          <Icon className="h-4 w-4 shrink-0" aria-hidden /> {label}
        </NavLink>
      ))}
    </>
  );
}

export default function AdminLayout() {
  const { logout } = useAdminAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const closeMobile = () => setMobileOpen(false);

  return (
    <div className="flex min-h-screen min-h-[100dvh] flex-col bg-[#0a0a0a] md:flex-row">
      {/* Mobile top bar */}
      <header className="sticky top-0 z-30 flex shrink-0 items-center justify-between border-b border-zinc-800 bg-[#121212]/95 px-3 py-3 backdrop-blur-md md:hidden">
        <div>
          <p className="text-base font-bold text-amber-400">MAHADEV</p>
          <p className="text-[10px] uppercase tracking-wide text-zinc-500">Admin</p>
        </div>
        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          className="rounded-lg p-2 text-zinc-300 hover:bg-zinc-800"
          aria-label="Open menu"
        >
          <Menu className="h-6 w-6" />
        </button>
      </header>

      {/* Mobile drawer */}
      {mobileOpen && (
        <>
          <button
            type="button"
            className="fixed inset-0 z-40 bg-black/70 md:hidden"
            aria-label="Close menu"
            onClick={closeMobile}
          />
          <aside className="fixed inset-y-0 left-0 z-50 flex w-[min(18rem,88vw)] flex-col border-r border-zinc-800 bg-[#141414] shadow-2xl md:hidden">
            <div className="flex items-center justify-between border-b border-zinc-800 p-4">
              <div>
                <p className="text-lg font-bold text-amber-400">MAHADEV</p>
                <p className="text-xs text-zinc-500">Admin</p>
              </div>
              <button
                type="button"
                onClick={closeMobile}
                className="rounded-lg p-2 text-zinc-400 hover:bg-zinc-800"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <nav className="flex flex-1 flex-col gap-0.5 overflow-y-auto p-3">
              <NavLinks onNavigate={closeMobile} />
            </nav>
            <button
              type="button"
              onClick={() => {
                logout();
                closeMobile();
                navigate('/login', { replace: true });
              }}
              className="m-3 flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm text-red-400 hover:bg-red-950/40"
            >
              <LogOut className="h-4 w-4" /> Log out
            </button>
          </aside>
        </>
      )}

      {/* Desktop sidebar */}
      <aside className="hidden w-56 shrink-0 flex-col border-b border-zinc-800 bg-surface-card md:flex md:border-b-0 md:border-r md:min-h-screen">
        <div className="p-4 md:p-5">
          <p className="text-lg font-bold text-amber-400">MAHADEV</p>
          <p className="text-xs text-zinc-500">Admin</p>
        </div>
        <nav className="flex flex-1 flex-col gap-0.5 px-2 pb-4">
          <NavLinks />
        </nav>
        <button
          type="button"
          onClick={() => {
            logout();
            navigate('/login', { replace: true });
          }}
          className="mx-2 mb-4 flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-red-400 hover:bg-red-950/40"
        >
          <LogOut className="h-4 w-4" /> Log out
        </button>
      </aside>

      <main className="min-w-0 flex-1 px-3 py-4 sm:px-4 sm:py-6 md:px-6 md:py-8 lg:px-10 lg:py-10">
        <div className="mx-auto max-w-[1400px]">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
