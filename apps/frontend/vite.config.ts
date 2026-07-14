import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "node:path";

export default defineConfig(({ mode }) => {
    const workspaceRoot = path.resolve(__dirname, "../..");
    const env = loadEnv(mode, workspaceRoot, "");

    const backendPort = Number(env["PORT"] ?? 3000);
    const frontendPort = Number(env["VITE_FRONTEND_PORT"] ?? backendPort + 1);

    return {
        plugins: [tailwindcss(), react()],
        resolve: {
            alias: {
                "@": path.resolve(__dirname, "./src"),
            },
        },
        server: {
            port: frontendPort,
            strictPort: false,
            proxy: {
                "/api": {
                    target: `http://localhost:${backendPort}`,
                    changeOrigin: true,
                    secure: false,
                },
            },
        },
    };
});
