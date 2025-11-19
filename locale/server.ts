import { en, Translations } from './en';

// Server-side translation function
export function getTranslations(): Translations {
  // For now, we only support English
  // In the future, this can be extended to support multiple languages based on request headers
  return en;
}
