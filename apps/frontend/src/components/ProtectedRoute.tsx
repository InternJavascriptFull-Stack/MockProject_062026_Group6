import { Navigate } from "react-router-dom";
import { session } from "../utils/session";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

/**
 * Wraps any route that requires a completed OTP-verified session.
 * If no access token exists → redirect to /login.
 */
export function ProtectedRoute({ children }: ProtectedRouteProps) {
  if (!session.isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
}
