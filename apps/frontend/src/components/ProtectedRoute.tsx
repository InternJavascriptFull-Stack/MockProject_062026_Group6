import { Navigate } from "react-router-dom";
import { session } from "../utils/session";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

/**
 * Wraps any route that requires a completed OTP-verified session.
 * If no access token exists → redirect to /login.
 */
export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  if (!session.isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  const user = session.getUser();
  if (allowedRoles?.length && !allowedRoles.includes(user?.roleName ?? "")) {
    return <Navigate to="/dashboard/admin" replace />;
  }

  return <>{children}</>;
}
