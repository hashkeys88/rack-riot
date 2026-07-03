import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { dashboardPathForRole } from '../lib/accountRole';

export default function AuthCallback() {
  const { user, profile, loading } = useAuth();

  if (loading || (user && !profile)) {
    return (
      <section className="flex min-h-[calc(100vh-76px)] items-center justify-center bg-atelier-paper px-6">
        <div className="text-center">
          <span className="mx-auto block h-3 w-3 animate-pulse rounded-full bg-atelier-citrus ring-8 ring-atelier-forest" />
          <p className="mt-8 font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-atelier-rust">Signing you in</p>
          <h1 className="mt-4 text-[38px] font-semibold tracking-[-0.03em] text-riotText">
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
