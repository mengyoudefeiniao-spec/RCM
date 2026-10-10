import { createContext, useContext } from 'react';
import { zh, LocaleTranslations } from './locales/zh';
import { ar } from './locales/ar';
import { ku } from './locales/ku';
import { en } from './locales/en';

export type Language = 'zh' | 'ar' | 'ku' | 'en';
export type Translations = LocaleTranslations;

// Maintained as four distinct, full vocabulary dictionary files (zh, ar, ku, en)
// When switching languages, ONLY vocabulary entries are replaced. Layout remains strictly fixed LTR.
export const TRANSLATIONS: Record<Language, Translations> = {
  zh,
  ar,
  ku,
  en
};

export interface I18nContextType {
  lang: Language;
  setLang: (lang: Language) => void;
  t: Translations;
  isRtl: boolean;
}

export const I18nContext = createContext<I18nContextType>({
  lang: 'zh',
  setLang: () => {},
  t: TRANSLATIONS.zh,
  isRtl: false
});

export const useI18n = () => useContext(I18nContext);
