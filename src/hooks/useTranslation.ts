import { useMemo } from 'react';
import translations from '@/translations/en.json';

type TranslationKeys = typeof translations;
type NestedKeyOf<T> = T extends object
  ? {
      [K in keyof T]: K extends string
        ? T[K] extends object
          ? `${K}.${NestedKeyOf<T[K]>}`
          : K
        : never;
    }[keyof T]
  : never;

type TranslationKey = NestedKeyOf<TranslationKeys>;

interface UseTranslationReturn {
  t: (key: TranslationKey, params?: Record<string, string | number>) => string;
  translations: typeof translations;
}

export function useTranslation(): UseTranslationReturn {
  const t = useMemo(() => {
    return (key: TranslationKey, params?: Record<string, string | number>): string => {
      const keys = key.split('.');
      let value: any = translations;

      for (const k of keys) {
        if (value && typeof value === 'object' && k in value) {
          value = value[k];
        } else {
          console.warn(`Translation key not found: ${key}`);
          return key;
        }
      }

      if (typeof value !== 'string') {
        console.warn(`Translation value is not a string: ${key}`);
        return key;
      }

      // Replace parameters in the translation string
      if (params) {
        return value.replace(/\{\{(\w+)\}\}/g, (match, paramKey) => {
          return params[paramKey]?.toString() || match;
        });
      }

      return value;
    };
  }, []);

  return { t, translations };
}
