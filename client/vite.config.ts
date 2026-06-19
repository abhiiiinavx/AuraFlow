import path from "node:path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    port: 5173,
    proxy: {
      "/api": {
        target: "https://auraflow-api-ck2v.onrender.com",
        changeOrigin: true,
        secure: true,
      },
      "/socket.io": {
        target: "https://auraflow-api-ck2v.onrender.com",
        ws: true,
        changeOrigin: true,
        secure: true,
      },
    },
  },
});