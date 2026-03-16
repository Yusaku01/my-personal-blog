import { LOCALES, DEFAULT_LOCALE, type Locale } from '@/lib/i18n/config';

export function getLocaleFromPath(pathname: string): Locale {
  const firstSegment = pathname.split('/').filter(Boolean)[0];
  if (firstSegment && (LOCALES as readonly string[]).includes(firstSegment)) {
    return firstSegment as Locale;
  }
  return DEFAULT_LOCALE;
}

export function stripLocalePrefix(pathname: string): string {
  const locale = getLocaleFromPath(pathname);
  if (locale === DEFAULT_LOCALE) return pathname;
  return pathname.replace(new RegExp(`^/${locale}(?=/|$)`), '') || '/';
}
