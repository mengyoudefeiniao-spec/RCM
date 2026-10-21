import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import tailwindcss from '@tailwindcss/vite';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const packageRoot = path.dirname(fileURLToPath(import.meta.url));
const sourceRoot = path.resolve(packageRoot, '..');
const sourceAppLayout = path.resolve(sourceRoot, 'src/components/layout/AppLayout.vue');
const overrideAppLayout = path.join(packageRoot, 'source-overrides', 'AppLayout.vue');

export default defineConfig({
  root: sourceRoot,
  configFile: false,
  plugins: [
    {
      name: 'rcm-apk-app-layout-override',
      enforce: 'pre',
      async load(id) {
        if (!id.includes('?')) {
          const resolvedId = path.resolve(id);
          if (resolvedId === sourceAppLayout) return readFile(overrideAppLayout, 'utf8');
        }
        return null;
      },
    },
    vue(),
    tailwindcss(),
  ],
  resolve: { alias: { '@': path.resolve(sourceRoot, 'src') } },
  build: {
    outDir: path.join(packageRoot, 'www'),
    emptyOutDir: true,
  },
});
