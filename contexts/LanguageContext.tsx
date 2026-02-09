import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import { translations } from '../i18n/locales';

export type Language = 'ar' | 'en' | 'fr';

// Define a type for nested translation keys for type safety
type NestedKeyOf<ObjectType extends object> =
  { [Key in keyof ObjectType & (string | number)]: ObjectType[Key] extends object
    ? `${Key}` | `${Key}.${NestedKeyOf<ObjectType[Key]>}`
    : `${Key}`
  }[keyof ObjectType & (string | number)];

export type TranslationKey = NestedKeyOf<typeof translations.en>;

interface LanguageContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: TranslationKey, vars?: Record<string, string | number>) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('language');
      return (saved === 'ar' || saved === 'en' || saved === 'fr') ? (saved as Language) : 'ar';
    }
    return 'ar';
  });

  useEffect(() => {
    // Apply language attributes to the root <html> element
    const root = window.document.documentElement;
    root.lang = language;
    root.dir = language === 'ar' ? 'rtl' : 'ltr';
    localStorage.setItem('language', language);
  }, [language]);

  const t = useCallback((key: TranslationKey, vars: Record<string, string | number> = {}) => {
    // Navigate through the nested object to find the translation string
    let text = key?.split('.').reduce((obj: any, k: string) => (obj as any)?.[k], translations[language]);

    // Fallback to English if translation is missing in the current language
    if (typeof text !== 'string') {
      text = key?.split('.').reduce((obj: any, k: string) => (obj as any)?.[k], translations['en']);
    }

    if (typeof text !== 'string') {
      console.warn(`Translation key '${key}' not found for language '${language}'.`);
      return key;
    }

    // Replace variables (e.g., {{name}})
    Object.keys(vars).forEach(varKey => {
      const regex = new RegExp(`{{${varKey}}}`, 'g');
      text = text.replace(regex, String(vars[varKey]));
    });

    return text;
  }, [language]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

// Helper function to get current language (can be used anywhere)
export const getCurrentLanguage = (): Language => {
  const root = window.document.documentElement;
  const lang = root.lang as Language;
  return lang || 'ar';
};

// Helper function to get language name
export const getLanguageName = (lang: Language): string => {
  switch (lang) {
    case 'ar': return 'Arabic';
    case 'en': return 'English';
    case 'fr': return 'French';
    default: return 'Unknown';
  }
};
