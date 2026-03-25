import { defineConfig } from 'vitest/config';
import preact from '@preact/preset-vite';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default defineConfig({
  plugins: [preact({ jsxImportSource: 'preact' })],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./lib/test/setup.ts'],
    include: ['lib/**/*.test.{ts,tsx}'],
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'lib'),
      react: 'preact/compat',
      'react-dom': 'preact/compat',
    },
  },
});
