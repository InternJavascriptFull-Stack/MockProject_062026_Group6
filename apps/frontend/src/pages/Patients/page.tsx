import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { authService } from "../../services/auth";
import { session } from "../../utils/session";
import type { User } from "../../types/auth";

export default function Patients() {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(session.getUser());
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Fetch fresh user info from GET /api/auth/me on mount
  useEffect(() => {
    authService.getMe().then((res) => {
      if (res.success && res.data) {
        setUser(res.data);
      }
    });
  }, []);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await authService.logout(); // calls POST /api/auth/logout + clears localStorage
    } catch {
      // clear session regardless of network error
      session.clear();
    } finally {
      navigate("/login", { replace: true });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* ── Top bar ────────────────────────────────────────────────────── */}
      <header className="flex items-center justify-between border-b border-slate-100 bg-white px-6 py-3 shadow-sm">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#2563EB]">
            <span className="text-sm font-extrabold text-white">N</span>
          </div>
          <span className="text-sm font-semibold text-slate-800">NHMS</span>
        </div>

        <div className="flex items-center gap-4">
          {/* User info */}
          {user && (
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-200 text-xs font-bold text-slate-600">
                {user.firstName?.[0]?.toUpperCase() ?? "U"}
              </div>
              <span className="font-medium">
                {user.firstName} {user.lastName}
              </span>
              {user.roleName && (
                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-400">
                  {user.roleName}
                </span>
              )}
            </div>
          )}

          {/* Logout button */}
          <button
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-500 transition-all hover:border-red-200 hover:bg-red-50 hover:text-red-600 disabled:pointer-events-none disabled:opacity-50"
          >
            {isLoggingOut ? (
              <>
                <svg
                  className="h-3.5 w-3.5 animate-spin"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v8H4z"
                  />
                </svg>
                Logging out...
              </>
            ) : (
              <>
                <svg
                  className="h-3.5 w-3.5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h6a2 2 0 012 2v1"
                  />
                </svg>
                Logout
              </>
            )}
          </button>
        </div>
      </header>

      {/* ── Page content ───────────────────────────────────────────────── */}
      <main className="p-8">
        <h1 className="mb-2 text-xl font-bold text-slate-800">Patients</h1>
        <p className="text-sm text-slate-400">Patient list will appear here.</p>

        {/* Demo: show current user data from GET /api/auth/me */}
        {user && (
          <div className="mt-6 max-w-md rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
            <p className="mb-3 text-xs font-bold tracking-wider text-slate-400 uppercase">
              Current user (GET /api/auth/me)
            </p>
            <div className="space-y-1.5 text-sm text-slate-700">
              <div>
                <span className="inline-block w-28 text-slate-400">Email</span>
                {user.email}
              </div>
              <div>
                <span className="inline-block w-28 text-slate-400">Name</span>
                {user.firstName} {user.lastName}
              </div>
              <div>
                <span className="inline-block w-28 text-slate-400">Role</span>
                {user.roleName ?? "—"}
              </div>
              <div>
                <span className="inline-block w-28 text-slate-400">Status</span>
                {user.status}
              </div>
              <div>
                <span className="inline-block w-28 text-slate-400">MFA</span>
                {user.mfaEnabled ? "Enabled" : "Disabled"}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
