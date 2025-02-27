import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../store/auth';
import type { User } from '../types';

interface PrivateRouteProps {
  children: React.ReactNode;
  allowedRoles: User['role'][];
}

function PrivateRoute({ children, allowedRoles }: PrivateRouteProps) {
  const { user, isAuthenticated } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (user && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

export default PrivateRoute;