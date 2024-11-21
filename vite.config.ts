import { defineConfig } from 'vite';
import pugPlugin from 'vite-plugin-pug';
import { resolve } from 'path';

export default defineConfig({
  //   plugins: [pugPlugin({ localImports: true })],
  build: {
    rollupOptions: {
      // we can use most of rollup plugin in vite app
      input: {
        main: resolve(__dirname, 'index.html'),
        earth: resolve(__dirname, 'earth/index.html'),
      },
    },
  },
});
