import { Navigate, useLocation } from 'react-router-dom';
import { useAdminAuth } from '../context/AdminAuthContext';

export default function ProtectedAdmin({ children }) {
  const { isAdmin, loading } = useAdminAuth();
  const loc = useLocation();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-amber-500 border-t-transparent" />
      </div>
    );
  }

  if (!isAdmin) {
    return <Navigate to="/login" state={{ from: loc }} replace />;
  }

  return children;
}
