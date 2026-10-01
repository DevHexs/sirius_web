import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://devhexs.github.io',
  base: '/sirius_web',
  output: 'static',
  build: {
    format: 'file',
  },
});
