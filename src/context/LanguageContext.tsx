import React, { createContext, useContext, useState, useEffect } from 'react';
import { Language, TRANSLATIONS, Translations, PRODUCT_TRANSLATIONS_TA } from '../i18n/translations';
import { Product } from '../types';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: keyof Translations, params?: Record<string, string | number>) => string;
  getLocalizedProduct: (product: Product) => Product;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    try {
      const saved = localStorage.getItem('agricare_lang') as Language;
      return saved === 'ta' ? 'ta' : 'en';
    } catch {
      return 'en';
    }
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    try {
      localStorage.setItem('agricare_lang', lang);
      document.documentElement.lang = lang;
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  const t = (key: keyof Translations, params?: Record<string, string | number>): string => {
    const translationGroup = TRANSLATIONS[language] || TRANSLATIONS.en;
    let text = translationGroup[key] || TRANSLATIONS.en[key] || String(key);

    if (params) {
      Object.entries(params).forEach(([paramKey, paramVal]) => {
        text = text.replace(new RegExp(`\\{${paramKey}\\}`, 'g'), String(paramVal));
      });
    }

    return text;
  };

  const getLocalizedProduct = (product: Product): Product => {
    if (language !== 'ta') {
      return product;
    }

    const tamilData = PRODUCT_TRANSLATIONS_TA[product.id];
    if (!tamilData) {
      return product;
    }

    return {
      ...product,
      name: tamilData.name,
      shortDescription: tamilData.shortDescription,
      unit: tamilData.unit,
      cropCompatibility: tamilData.cropCompatibility,
      usageInstructions: tamilData.usageInstructions,
    };
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, getLocalizedProduct }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
