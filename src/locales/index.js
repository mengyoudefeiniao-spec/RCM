import { createI18n } from 'vue-i18n';
import { ref, computed } from 'vue';

// Element Plus 语言包
import elZhCn from 'element-plus/es/locale/lang/zh-cn';
import elEn from 'element-plus/es/locale/lang/en';
import elAr from 'element-plus/es/locale/lang/ar';

// 本地业务词条包
import zh from './zh.js';
import en from './en.js';
import ar from './ar.js';
import ku from './ku.js';

export const SUPPORTED_LANGUAGES = [
  { code: 'zh', name: '简体中文', nativeName: '中文 (ZH)', flag: '🇨🇳' },
  { code: 'en', name: 'English', nativeName: 'English (US)', flag: '🇺🇸' },
  { code: 'ar', name: 'العربية', nativeName: 'العربية (IQ)', flag: '🇮🇶' },
  { code: 'ku', name: 'Kurdî', nativeName: 'کوردی (KU)', flag: '☀️' }
];

const savedLang = localStorage.getItem('rcm_language') || 'zh';

export const i18n = createI18n({
  legacy: false, // Composition API 模式
  locale: savedLang,
  fallbackLocale: 'zh',
  messages: {
    zh,
    en,
    ar,
    ku
  }
});

// 当前响应式语言代码
export const currentLang = ref(savedLang);

// Element Plus 语言包映射联动
export const elementLocale = computed(() => {
  switch (currentLang.value) {
    case 'en':
      return elEn;
    case 'ar':
    case 'ku':
      return elAr;
    case 'zh':
    default:
      return elZhCn;
  }
});

/**
 * 切换全局语言
 * 确保各语言切换时保持全局骨架与对齐布局一致（统一维持标准现代化 LTR 容器布局，避免左右颠倒导致UI错位）
 * @param {string} lang 'zh' | 'en' | 'ar' | 'ku'
 */
export function setLanguage(lang) {
  if (!['zh', 'en', 'ar', 'ku'].includes(lang)) return;

  currentLang.value = lang;
  i18n.global.locale.value = lang;
  localStorage.setItem('rcm_language', lang);

  // 保持全局容器排版走向严格一致 (dir="ltr")，防止左右镜像颠倒破坏导航与栅格系统
  document.documentElement.setAttribute('dir', 'ltr');
  document.documentElement.setAttribute('lang', lang);
}

// 页面初始化时执行一致性初始化
(function initLayoutDirection() {
  document.documentElement.setAttribute('dir', 'ltr');
  document.documentElement.setAttribute('lang', savedLang);
})();
