import react from "@vitejs/plugin-react";
import path from "path";
import { defineConfig } from "vite";

// 代理地址
const proxyUrl = "http://localhost:3008";

// https://vitejs.dev/config/
export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src/"),
      components: `${path.resolve(__dirname, "./src/components/")}`,
      public: `${path.resolve(__dirname, "./public/")}`,
      pages: path.resolve(__dirname, "./src/pages"),
    },
  },
  plugins: [react()],
  server: {
    host: "0.0.0.0",
    port: 3004,
    open: true,
    proxy: {
      "/api": {
        target: proxyUrl,
        secure: /https/.test(proxyUrl), // 如果是https接口，需要配置这个参数
        changeOrigin: true, // 如果接口跨域，需要进行这个参数配置
        rewrite: (path: string) => path.replace(/^\/api/, ""),
      },
      "/static": {
        target: proxyUrl,
        secure: /https/.test(proxyUrl), // 如果是https接口，需要配置这个参数
        changeOrigin: true, // 如果接口跨域，需要进行这个参数配置
        rewrite: (path: string) => path.replace(/^\/static/, ""),
      },
    },
  },
});
