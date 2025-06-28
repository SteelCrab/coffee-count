import { useState } from 'react';
import { Language, languages } from '../locales';

const LANGUAGE_STORAGE_KEY = 'flexible-counter-language';

export const useTranslation = () => {
  const [currentLanguage, setCurrentLanguage] = useState<Language>(() => {
    // 로컬 스토리지에서 언어 설정 불러오기
    const savedLanguage = localStorage.getItem(LANGUAGE_STORAGE_KEY) as Language;
    if (savedLanguage && languages[savedLanguage]) {
      return savedLanguage;
    }
    
    // 브라우저 언어 감지
    const browserLanguage = navigator.language.toLowerCase();
    if (browserLanguage.startsWith('ko')) return 'ko';
    if (browserLanguage.startsWith('ja')) return 'ja';
    return 'en'; // 기본값
  });

  const translations = languages[currentLanguage];

  const changeLanguage = (language: Language) => {
    setCurrentLanguage(language);
    localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
  };

  // 중첩된 키를 지원하는 번역 함수
  const t = (key: string): string => {
    const keys = key.split('.');
    let value: any = translations;
    
    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        console.warn(`Translation key not found: ${key}`);
        return key; // 키를 찾을 수 없으면 키 자체를 반환
      }
    }
    
    return typeof value === 'string' ? value : key;
  };

  return {
    currentLanguage,
    changeLanguage,
    t,
    translations
  };
};
