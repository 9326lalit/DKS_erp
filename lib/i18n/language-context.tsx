"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { Language, translations } from "@/lib/i18n/translations";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, fallback?: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const LANGUAGE_STORAGE_KEY = "dks_app_language";

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>("en");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Read saved language from localStorage or Cookie
    const savedLang = localStorage.getItem(LANGUAGE_STORAGE_KEY) as Language;
    if (savedLang && (savedLang === "en" || savedLang === "hi" || savedLang === "mr")) {
      setLanguageState(savedLang);
    } else {
      // Check document cookie
      const match = document.cookie.match(new RegExp("(?:^|; )" + "app_lang" + "=([^;]*)"));
      if (match && (match[1] === "en" || match[1] === "hi" || match[1] === "mr")) {
        setLanguageState(match[1] as Language);
      }
    }
    setMounted(true);
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    if (typeof window !== "undefined") {
      localStorage.setItem(LANGUAGE_STORAGE_KEY, lang);
      document.cookie = `app_lang=${lang}; path=/; max-age=31536000; SameSite=Lax`;
    }
  };

  const t = (key: string, fallback?: string): string => {
    const translationItem = translations[key];
    if (!translationItem) {
      return fallback || key;
    }
    return translationItem[language] || translationItem.en || fallback || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    // Return a safe fallback if used outside provider
    return {
      language: "en" as Language,
      setLanguage: () => {},
      t: (key: string, fallback?: string) => fallback || key
    };
  }
  return context;
}
