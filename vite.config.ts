import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';


export default defineConfig({
  plugins: [react()],
   build: {
    outDir: 'build',  // This will set the output directory to 'build'
  },
  server: {
    proxy: {
      '/storage': { target: 'https://dev3.eoe.lk', changeOrigin: true },
      '/api':     { target: 'https://dev3.eoe.lk', changeOrigin: true },
    },
  },
});