import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { dashboardPathForRole } from '../lib/accountRole';

export default function AuthCallback() {
  const { user, profile, loading } = useAuth();

  if (loading || (user && !profile)) {
    return (
      <section className="flex min-h-[calc(100vh-72px)] items-center justify-center bg-[#f7f7f7] px-6">
        <div className="text-center">
          <p className="text-[12px] font-bold uppercase tracking-[0.18em] text-riotAccent">Email confirmed</p>
          <h1 className="mt-3 text-[28px] font-extrabold tracking-[-0.03em] text-riotText">
            Opening your dashboard...
          </h1>
        </div>
      </section>
    );
  }

  if (user && profile) {
    return <Navigate to={dashboardPathForRole(profile.role)} replace />;
  }

  return <Navigate to="/login?confirmation=invalid" replace />;
}
