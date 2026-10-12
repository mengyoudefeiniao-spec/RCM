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
  { code: 'zh', name: '简体中文', nativeName: '中文 (ZH)', dir: 'ltr', flag: '🇨🇳' },
  { code: 'en', name: 'English', nativeName: 'English (US)', dir: 'ltr', flag: '🇺🇸' },
  { code: 'ar', name: 'العربية', nativeName: 'العربية (IQ)', dir: 'rtl', flag: '🇮🇶' },
  { code: 'ku', name: 'Kurdî', nativeName: 'کوردی (KU)', dir: 'rtl', flag: '☀️' }
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
      return elAr;
    case 'ku':
      // 库尔德语使用 RTL 体验且与阿拉伯语基础通用
      return elAr;
    case 'zh':
    default:
      return elZhCn;
  }
});

/**
 * 切换全局语言
 * @param {string} lang 'zh' | 'en' | 'ar' | 'ku'
 */
export function setLanguage(lang) {
  if (!['zh', 'en', 'ar', 'ku'].includes(lang)) return;

  currentLang.value = lang;
  i18n.global.locale.value = lang;
  localStorage.setItem('rcm_language', lang);

  // 动态处理文本走向 (LTR / RTL)
  const isRtl = lang === 'ar' || lang === 'ku';
  document.documentElement.setAttribute('dir', isRtl ? 'rtl' : 'ltr');
  document.documentElement.setAttribute('lang', lang);

  // 根据语言定制字体与排版类
  if (isRtl) {
    document.documentElement.classList.add('rtl-layout');
  } else {
    document.documentElement.classList.remove('rtl-layout');
  }
}

// 页面初始化时执行一次文本排版初始化
(function initLayoutDirection() {
  const isRtl = savedLang === 'ar' || savedLang === 'ku';
  document.documentElement.setAttribute('dir', isRtl ? 'rtl' : 'ltr');
  document.documentElement.setAttribute('lang', savedLang);
  if (isRtl) {
    document.documentElement.classList.add('rtl-layout');
  }
})();
