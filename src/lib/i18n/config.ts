export const LOCALES = ['ja', 'en'] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = 'ja';

export const LOCALE_META: Record<Locale, { lang: string; ogLocale: string }> = {
  ja: { lang: 'ja', ogLocale: 'ja_JP' },
  en: { lang: 'en', ogLocale: 'en_US' },
};
