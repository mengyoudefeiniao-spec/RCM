import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';

export default defineConfig({
  plugins: [vue(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    proxy: {
      '/__huawei_frs': {
        target: 'https://face.cn-north-4.myhuaweicloud.com',
        changeOrigin: true,
        rewrite: (url) => url.replace(/^\/__huawei_frs/, ''),
      },
    },
    port: 3000,
    host: '0.0.0.0',
  },
});
