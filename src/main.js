import { createApp } from 'vue';
import { createPinia } from 'pinia';
import ElementPlus from 'element-plus';
import 'element-plus/dist/index.css';
import * as ElementPlusIconsVue from '@element-plus/icons-vue';

import App from './App.vue';
import router from './router/index.js';
import { i18n } from './locales/index.js';
import './style.css';
import './styles/theme.scss';
import './styles/mobile-theme.scss';
import './styles/dialog-responsive.css';
import './assets/css/ht-theme.css';
import './styles/rtl.css';
import './styles/reference-theme.css';
import { initializePocketBaseSync } from './services/pocketBaseSync.js';

async function startApp() {
  try {
    await initializePocketBaseSync();
  } catch (error) {
    // Keep the demo usable if PocketBase is temporarily unavailable.
    console.error('[App] Starting with the local business cache because PocketBase sync did not complete.', error);
  }

  const app = createApp(App);

  // 注册所有 Element Plus 图标组件
  for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
    app.component(key, component);
  }

  app.use(createPinia());
  app.use(router);
  app.use(i18n);
  app.use(ElementPlus);

  app.mount('#app');
}

startApp();
