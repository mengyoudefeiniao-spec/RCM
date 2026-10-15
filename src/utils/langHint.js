/**
 * 轻量语言判断工具：供无 i18n 注入的视图/store 模块在提示词中使用
 */
import { i18n } from '../locales/index.js';

export function isEnNow() {
  try {
    return (i18n?.global?.locale?.value || 'zh') === 'en';
  } catch (e) {
    return false;
  }
}
