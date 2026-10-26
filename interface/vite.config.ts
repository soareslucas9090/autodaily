import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:3001",
        timeout: 0,
        proxyTimeout: 0,
        configure(proxy) {
          proxy.on("proxyRes", (proxyRes) => {
            const tipo = proxyRes.headers["content-type"];
            if (typeof tipo === "string" && tipo.includes("text/event-stream")) {
              proxyRes.headers["cache-control"] = "no-cache";
              proxyRes.headers["connection"] = "keep-alive";
              delete proxyRes.headers["content-length"];
            }
          });
        },
      },
    },
  },
});
