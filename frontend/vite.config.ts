import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// Proxy API và file tĩnh sang backend FastAPI (port 8080) để tránh CORS
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 3000,
    proxy: {
      "/api": { target: "http://127.0.0.1:8080", changeOrigin: true },
      "/tasks": { target: "http://127.0.0.1:8080", changeOrigin: true },
      "/docs": { target: "http://127.0.0.1:8080", changeOrigin: true },
      "/openapi.json": { target: "http://127.0.0.1:8080", changeOrigin: true },
    },
  },
});
