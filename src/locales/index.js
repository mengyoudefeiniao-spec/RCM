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
import ckb from './ku.js';
import myMessages from './my.js';
import citizenOrderMessages from './citizenOrder.js';
import agentDeliveryMessages from './agentDelivery.js';
import adminCenterMessages from './adminCenter.js';
import systemExtras from './systemExtras.js';
import mailCenterMessages from './mailCenter.js';
import memberRegistrationMessages from './memberRegistration.js';
import citizenApplicationMessages from './citizenApplications.js';
import citizenTransferMessages from './citizenTransfer.js';
import changeHeadMessages from './changeHead.js';

function withCitizenApplications(messages, lang) {
  const merged = { ...messages };
  for (const pack of [citizenApplicationMessages[lang], citizenTransferMessages[lang], { changeHead: changeHeadMessages[lang] }]) {
    for (const [scope, entries] of Object.entries(pack)) {
      merged[scope] = { ...merged[scope], ...entries };
    }
  }
  return merged;
}

// ku/kmr is Kurmanji (Latin script); the existing Arabic-script catalog is Sorani.
// sdh is recorded here for future catalogs, but is not offered without translations.
export const LANGUAGE_DIRECTIONS = Object.freeze({
  zh: 'ltr', en: 'ltr', ar: 'rtl', ckb: 'rtl', sdh: 'rtl', kmr: 'ltr', ku: 'ltr'
});

export const SUPPORTED_LANGUAGES = [
  { code: 'zh', name: '简体中文', nativeName: '中文 (ZH)', flag: '🇨🇳', dir: 'ltr' },
  { code: 'en', name: 'English', nativeName: 'English (US)', flag: '🇺🇸', dir: 'ltr' },
  { code: 'ar', name: 'العربية', nativeName: 'العربية (IQ)', flag: '🇮🇶', dir: 'rtl' },
  { code: 'ckb', name: 'کوردی', nativeName: 'سۆرانی (CKB)', flag: '☀️', dir: 'rtl' }
];

const storedLang = localStorage.getItem('rcm_language') || 'zh';
// Previous versions used `ku` for the Sorani catalog. Migrate that saved choice.
const migratedLang = storedLang === 'ku' ? 'ckb' : storedLang;
const savedLang = SUPPORTED_LANGUAGES.some(({ code }) => code === migratedLang) ? migratedLang : 'zh';
if (storedLang !== savedLang) localStorage.setItem('rcm_language', savedLang);

export const i18n = createI18n({
  legacy: false, // Composition API 模式
  locale: savedLang,
  fallbackLocale: 'zh',
  messages: {
    zh: withCitizenApplications({ ...zh, my: myMessages.zh, citizenOrder: citizenOrderMessages.zh, agentDelivery: agentDeliveryMessages.zh, ...adminCenterMessages.zh, ...systemExtras.zh, ...mailCenterMessages.zh, memberRegistration: memberRegistrationMessages.zh }, 'zh'),
    en: withCitizenApplications({ ...en, my: myMessages.en, citizenOrder: citizenOrderMessages.en, agentDelivery: agentDeliveryMessages.en, ...adminCenterMessages.en, ...systemExtras.en, ...mailCenterMessages.en, memberRegistration: memberRegistrationMessages.en }, 'en'),
    ar: withCitizenApplications({ ...ar, my: myMessages.ar, citizenOrder: citizenOrderMessages.ar, agentDelivery: agentDeliveryMessages.ar, ...adminCenterMessages.ar, ...systemExtras.ar, ...mailCenterMessages.ar, memberRegistration: memberRegistrationMessages.ar }, 'ar'),
    ckb: withCitizenApplications({ ...ckb, my: myMessages.ckb, citizenOrder: citizenOrderMessages.ckb, agentDelivery: agentDeliveryMessages.ckb, ...adminCenterMessages.ckb, ...systemExtras.ckb, ...mailCenterMessages.ckb, memberRegistration: memberRegistrationMessages.ckb }, 'ckb')
  }
});

// 当前响应式语言代码
export const currentLang = ref(savedLang);
export const currentDirection = computed(() => LANGUAGE_DIRECTIONS[currentLang.value] || 'ltr');

// Element Plus 语言包映射联动
export const elementLocale = computed(() => {
  switch (currentLang.value) {
    case 'en':
      return elEn;
    case 'ar':
    case 'ckb':
      return elAr;
    case 'zh':
    default:
      return elZhCn;
  }
});

/**
 * 切换全局语言
 * 根据语言设置文档阅读与布局方向。
 * @param {string} lang 'zh' | 'en' | 'ar' | 'ckb'
 */
export function setLanguage(lang) {
  if (!SUPPORTED_LANGUAGES.some(({ code }) => code === lang)) return;

  currentLang.value = lang;
  i18n.global.locale.value = lang;
  localStorage.setItem('rcm_language', lang);

  document.documentElement.setAttribute('dir', LANGUAGE_DIRECTIONS[lang]);
  document.documentElement.setAttribute('lang', lang);

  // 分发全局语言切换事件，通知业务 Store 响应式刷新对应语言的测试数据
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('rcm-language-changed', { detail: lang }));
  }
}

// 页面初始化时执行一致性初始化
(function initLayoutDirection() {
  document.documentElement.setAttribute('dir', LANGUAGE_DIRECTIONS[savedLang] || 'ltr');
  document.documentElement.setAttribute('lang', savedLang);
})();
