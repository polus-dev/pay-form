import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import * as path from "path";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: "build", commonjsOptions: {
      transformMixedEsModules: true
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
      // fix by https://github.com/Uniswap/sdk-core/issues/20#issuecomment-1557317607
      "jsbi": path.resolve(__dirname, '.', 'node_modules', 'jsbi', 'dist', 'jsbi-cjs.js')
    }
  },
  server: {
    port: 3000,
    host: "0.0.0.0",
  },

});
