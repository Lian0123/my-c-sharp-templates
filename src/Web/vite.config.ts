import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
export default defineConfig({
  plugins: [react()],
  server: { proxy: { '/api': 'http://localhost:8080', '/hubs': { target: 'ws://localhost:8080', ws: true } } },
  build: { chunkSizeWarningLimit: 1500 },
  test: {
    environment: 'jsdom', globals: true, setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.test.{ts,tsx}'],
    coverage: { provider: 'v8', include: ['src/**/*.{ts,tsx}'], exclude: ['src/test/**', 'src/**/*.test.*', 'src/api/generated/**'],
      reporter: ['text', 'lcov', 'html', 'json-summary'], thresholds: { lines: 95, branches: 90 } }
  }
});
