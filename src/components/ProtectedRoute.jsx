import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, role }) => {
  const { user, profile, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-[calc(100vh-76px)] items-center justify-center bg-atelier-paper">
        <p className="font-mono text-[11px] font-bold uppercase tracking-[0.18em] text-atelier-muted">Loading your space...</p>
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;

  if (role && profile?.role && profile.role !== role) {
    if (profile.role === 'stylist') return <Navigate to="/stylist-dashboard" replace />;
    if (profile.role === 'admin') return <Navigate to="/admin" replace />;
    return <Navigate to="/dashboard" replace />;
  }

  if (role && role !== 'client' && !profile) {
    return (
      <div className="flex min-h-[calc(100vh-76px)] items-center justify-center bg-atelier-paper">
        <p className="font-mono text-[11px] font-bold uppercase tracking-[0.18em] text-atelier-muted">Loading your profile...</p>
      </div>
    );
  }

  return children;
};

export default ProtectedRoute;
