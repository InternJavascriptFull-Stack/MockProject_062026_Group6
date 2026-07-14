import axios from "axios";
import { session } from "../utils/session";

export const apiClient = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL ?? "/api",
    timeout: 15000,
    headers: { "Content-Type": "application/json" },
});

apiClient.interceptors.request.use((config) => {
    const token = session.getAccessToken();
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        const message = error.response?.data?.message ?? error.message ?? "The request could not be completed.";
        return Promise.reject(new Error(Array.isArray(message) ? message.join(", ") : message));
    },
);
