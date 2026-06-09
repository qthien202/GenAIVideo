import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// Proxy API và file tĩnh sang backend FastAPI (port 8080) để tránh CORS
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 3000,
    // host: true → mở ra LAN để điện thoại/máy khác cùng WiFi vào được
    // (truy cập http://<IP-máy-này>:3000). Chỉ nên dùng trên WiFi tin tưởng.
    host: true,
    proxy: {
      "/api": { target: "http://127.0.0.1:8080", changeOrigin: true },
      "/tasks": { target: "http://127.0.0.1:8080", changeOrigin: true },
      "/docs": { target: "http://127.0.0.1:8080", changeOrigin: true },
      "/openapi.json": { target: "http://127.0.0.1:8080", changeOrigin: true },
    },
  },
});
