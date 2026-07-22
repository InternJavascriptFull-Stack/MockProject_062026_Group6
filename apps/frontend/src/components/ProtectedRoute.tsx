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
  const userRole = (user?.roleName || "").toLowerCase();

  if (allowedRoles?.length) {
    const isAllowed = allowedRoles.some((allowed) =>
      userRole.includes(allowed.toLowerCase())
    );
    if (!isAllowed) {
      return <Navigate to="/dashboard" replace />;
    }
  }

  return <>{children}</>;
}
