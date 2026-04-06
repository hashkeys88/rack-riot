import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, role }) => {
  const { user, profile, loading } = useAuth();

  if (loading) {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          background: '#0a0a0a',
          color: '#f5f0e8'
        }}
      >
        <p>Loading...</p>
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
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          background: '#0a0a0a',
          color: '#f5f0e8'
        }}
      >
        <p>Loading your profile...</p>
      </div>
    );
  }

  return children;
};

export default ProtectedRoute;
