import { defineConfig } from 'vite';
import preact from '@preact/preset-vite';
import analyzer from 'vite-bundle-analyzer';
import preload from 'vite-plugin-preload';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    preact(),
    preload(),
    analyzer({ enabled: process.env.ANALYZE === 'true' }),
  ],
});
