import { fileURLToPath, URL } from 'url';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import environment from 'vite-plugin-environment';
import dotenv from 'dotenv';

dotenv.config({ path: '../../.env' });

export default defineConfig({
  define: {
    'import.meta.env.VITE_CANISTER_ID_AGENT_MANAGER': JSON.stringify(process.env.CANISTER_ID_AGENT_MANAGER),
    'import.meta.env.VITE_CANISTER_ID_METRICS_COLLECTOR': JSON.stringify(process.env.CANISTER_ID_METRICS_COLLECTOR),
    'import.meta.env.VITE_CANISTER_ID_LLM_PROCESSOR': JSON.stringify(process.env.CANISTER_ID_LLM_PROCESSOR),
    'import.meta.env.VITE_CANISTER_ID_DATA_STORAGE': JSON.stringify(process.env.CANISTER_ID_DATA_STORAGE),
    'import.meta.env.VITE_CANISTER_ID_AUTH_PROXY': JSON.stringify(process.env.CANISTER_ID_AUTH_PROXY),
    'import.meta.env.VITE_DFX_NETWORK': JSON.stringify(process.env.DFX_NETWORK),
  },
  build: {
    emptyOutDir: true,
    rollupOptions: {
      output: {
        // Avoid eval() usage that triggers CSP errors
        format: 'es',
      },
    },
  },
  optimizeDeps: {
    esbuildOptions: {
      define: {
        global: "globalThis",
      },
    },
  },
  server: {
    proxy: {
      "/api": {
        target: "http://127.0.0.1:4943",
        changeOrigin: true,
      },
    },
    historyApiFallback: {
      rewrites: [
        { from: /^\/embed/, to: '/index.html' },
      ],
    },
  },
  plugins: [
    react(),
    environment("all", { prefix: "CANISTER_" }),
    environment("all", { prefix: "DFX_" }),
    environment("all", { prefix: "REACT_APP_" }),
  ],
  resolve: {
    alias: [
      {
        find: "declarations",
        replacement: fileURLToPath(
          new URL("../declarations", import.meta.url)
        ),
      },
      {
        find: "@",
        replacement: fileURLToPath(new URL("./src", import.meta.url)),
      },
    ],
    dedupe: ['@dfinity/agent'],
  },
});
