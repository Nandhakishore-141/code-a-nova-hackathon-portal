import { Navigate, useLocation } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

/**
 * Protects private routes (/dashboard, /register) behind JWT verification.
 */
const PrivateRoute = ({ children }) => {
  const { isAuthenticated, isAuthLoading } = useAuth();
  const location = useLocation();

  if (isAuthLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center bg-slate-50/40 px-4">
        <div className="editorial-card flex items-center gap-3 px-5 py-3.5 text-sm font-medium text-slate-600 animate-fade-in">
          <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
          <span>Verifying session...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return children;
};

export default PrivateRoute;

