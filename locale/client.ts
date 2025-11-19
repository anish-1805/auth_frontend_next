import { en, Translations } from './en';

// Client-side translation hook
export function useTranslations(): Translations {
  // For now, we only support English
  // In the future, this can be extended to support multiple languages
  return en;
}
