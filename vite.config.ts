import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';

export default defineConfig({
  plugins: [vue(), tailwindcss(), {
    name: 'local-iam-only',
    configureServer(server) {
      server.middlewares.use('/__huawei_iam', (req, res, next) => {
        const remote = req.socket.remoteAddress || '';
        const host = req.headers.host || '';
        const local = ['127.0.0.1', '::1', '::ffff:127.0.0.1'].includes(remote);
        const localHost = /^(localhost|127\.0\.0\.1|\[::1\])(?::\d+)?$/i.test(host);
        const sameOrigin = !req.headers.origin || req.headers.origin === `http://${host}` || req.headers.origin === `https://${host}`;
        if (!local || !localHost || !sameOrigin || req.method !== 'POST' || req.url !== '/v3/auth/tokens?nocatalog=true') {
          res.statusCode = 403; res.end(); return;
        }
        next();
      });
    },
  }],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    proxy: {
      '/__huawei_iam': {
        target: 'https://iam.cn-north-4.myhuaweicloud.com',
        changeOrigin: true,
        rewrite: (url) => url.replace(/^\/__huawei_iam/, ''),
      },
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
