import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig(({ mode }) => ({
  base: mode === 'production' ? '/RevoRevis/' : '/',
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        p1: resolve(__dirname, 'p1.html'),
        p2: resolve(__dirname, 'p2.html'),
        p3: resolve(__dirname, 'p3.html'),
        p4: resolve(__dirname, 'p4.html')
      }
    }
  }
}));
