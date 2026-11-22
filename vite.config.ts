import { defineConfig } from 'vite';
import path from 'node:path';

export default defineConfig({
  base: './',
  resolve: {
    alias: {
      '@core': path.resolve(__dirname, 'src/core'),
      '@world': path.resolve(__dirname, 'src/world'),
      '@terrain': path.resolve(__dirname, 'src/terrain'),
      '@roads': path.resolve(__dirname, 'src/roads'),
      '@buildings': path.resolve(__dirname, 'src/buildings'),
      '@districts': path.resolve(__dirname, 'src/districts'),
      '@vegetation': path.resolve(__dirname, 'src/vegetation'),
      '@player': path.resolve(__dirname, 'src/player'),
      '@camera': path.resolve(__dirname, 'src/camera'),
      '@physics': path.resolve(__dirname, 'src/physics'),
      '@controls': path.resolve(__dirname, 'src/controls'),
      '@ui': path.resolve(__dirname, 'src/ui'),
      '@systems': path.resolve(__dirname, 'src/systems'),
    },
  },
  build: {
    target: 'es2022',
    sourcemap: true,
    chunkSizeWarningLimit: 1500,
    rollupOptions: {
      output: {
        manualChunks: {
          babylon: ['@babylonjs/core', '@babylonjs/loaders'],
        },
      },
    },
  },
});
