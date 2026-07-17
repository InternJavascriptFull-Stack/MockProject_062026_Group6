import { create } from "zustand";
import type { User } from "../types/auth";

// ─── Storage keys ─────────────────────────────────────────────────────────────
const ACCESS_TOKEN_KEY = "accessToken";
const REFRESH_TOKEN_KEY = "refreshToken";
const USER_KEY = "user";

// ─── Helpers (read-only localStorage access, no side-effects) ─────────────────
function readAccessToken(): string | null {
    return localStorage.getItem(ACCESS_TOKEN_KEY);
}

function readUser(): User | null {
    const raw = localStorage.getItem(USER_KEY);
    if (!raw) return null;
    try {
        return JSON.parse(raw) as User;
    } catch {
        return null;
    }
}

// ─── Zustand auth store ───────────────────────────────────────────────────────
/**
 * Global auth state managed via Zustand.
 * Hydrated from localStorage on first load so reloads don't require re-login.
 * Components subscribe to this store and re-render automatically on changes.
 */
interface AuthState {
    accessToken: string | null;
    user: User | null;
    isAuthenticated: boolean;

    /** Persist tokens + user to localStorage and update store. */
    save: (accessToken: string, refreshToken: string, user: User) => void;

    /** Clear store and localStorage. */
    clear: () => void;

    /** Convenience accessor for Bearer header value. */
    getAccessToken: () => string | null;

    /** Convenience accessor for user. */
    getUser: () => User | null;

    /** Read refresh token directly from localStorage (not stored in memory for safety). */
    getRefreshToken: () => string | null;
}

export const useAuthStore = create<AuthState>()((set, get) => ({
    // Hydrate from localStorage on first call
    accessToken: readAccessToken(),
    user: readUser(),
    isAuthenticated: Boolean(readAccessToken()),

    save(accessToken, refreshToken, user) {
        localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
        localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
        localStorage.setItem(USER_KEY, JSON.stringify(user));
        set({ accessToken, user, isAuthenticated: true });
    },

    clear() {
        localStorage.removeItem(ACCESS_TOKEN_KEY);
        localStorage.removeItem(REFRESH_TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
        set({ accessToken: null, user: null, isAuthenticated: false });
    },

    getAccessToken() {
        return get().accessToken;
    },

    getUser() {
        return get().user;
    },

    getRefreshToken() {
        return localStorage.getItem(REFRESH_TOKEN_KEY);
    },
}));

/**
 * Backward-compatible session object for code that imports `session` directly.
 * Delegates to the Zustand store so all callers stay in sync.
 */
export const session = {
    save: (accessToken: string, refreshToken: string, user: User) => useAuthStore.getState().save(accessToken, refreshToken, user),
    clear: () => useAuthStore.getState().clear(),
    getAccessToken: () => useAuthStore.getState().getAccessToken(),
    getRefreshToken: () => useAuthStore.getState().getRefreshToken(),
    getUser: () => useAuthStore.getState().getUser(),
    isAuthenticated: () => useAuthStore.getState().isAuthenticated,
};
