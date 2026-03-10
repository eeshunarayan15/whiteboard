// // import { defineConfig } from 'vite'
// import tailwindcss from "@tailwindcss/vite";
// // import react from '@vitejs/plugin-react'

// // // https://vite.dev/config/
// // export default defineConfig({
// //   plugins: [react(), tailwindcss()],
// // });

// import { defineConfig } from 'vite'
// import react from '@vitejs/plugin-react'

// export default defineConfig({
//   plugins: [react(), tailwindcss()],
//   define: {
//     global: "globalThis", // ← add this line
//   },
//   server: {
//     port: 5173,
//     proxy: {
//       "/api": {
//         target: "http://localhost:8080",
//         changeOrigin: true,
//       },
//       "/ws": {
//         target: "http://localhost:8080",
//         changeOrigin: true,
//         ws: true,
//       },
//     },
//   },
// });
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  define: {
    global: "globalThis",
  },
  server: {
    port: 5173,
    proxy: {
      "/api": {
        target: "http://localhost:8080",
        changeOrigin: true,
      },
      "/ws": {
        target: "http://localhost:8080",
        changeOrigin: true,
        ws: true,
      },
    },
  },
});