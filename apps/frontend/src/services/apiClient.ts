import axios from "axios";
import { session } from "../utils/session";

export const apiClient = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL ?? "/api",
    timeout: 15000,
    headers: { "Content-Type": "application/json" },
});

// Attach Bearer token to every request
apiClient.interceptors.request.use((config) => {
    const token = session.getAccessToken();
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Normalise error messages; redirect to /login on 401
apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Token expired or invalid — clear session and send to login
            session.clear();
            // Only redirect if not already on an auth page to avoid loops
            if (!window.location.pathname.startsWith("/login") && !window.location.pathname.startsWith("/activate") && !window.location.pathname.startsWith("/verify-otp")) {
                window.location.href = "/login";
            }
        }

        const message = error.response?.data?.message ?? error.message ?? "The request could not be completed.";

        return Promise.reject(new Error(Array.isArray(message) ? message.join(", ") : message));
    },
);
