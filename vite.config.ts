import { defineConfig } from 'vite';
import { resolve } from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
      '@config': resolve(__dirname, './src/config'),
      '@engine': resolve(__dirname, './src/engine'),
      '@models': resolve(__dirname, './src/models'),
      '@storage': resolve(__dirname, './src/storage'),
      '@ui': resolve(__dirname, './src/ui'),
      '@utils': resolve(__dirname, './src/utils'),
      '@workers': resolve(__dirname, './src/workers'),
    },
  },
  publicDir: 'public',
  build: {
    target: 'es2020',
    outDir: 'dist',
    sourcemap: true,
  },
  worker: {
    format: 'es',
    plugins: () => [],
  },
  server: {
    port: 3000,
    open: true,
  },
  test: {
    globals: true,
    environment: 'happy-dom',
    setupFiles: ['./tests/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'tests/',
        '**/*.test.ts',
        '**/*.config.ts',
      ],
    },
  },
});
