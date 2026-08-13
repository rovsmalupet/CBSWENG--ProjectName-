import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => ({
  plugins: [react()],
  // Development keeps diagnostic output; production bundles contain neither
  // browser console traces nor debugger statements that could disclose
  // internal response or component details to end users.
  esbuild: {
    drop: mode === "production" ? ["console", "debugger"] : [],
  },
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:3000",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ""),
      },
    },
  },
}));
