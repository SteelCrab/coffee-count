import { ko } from './ko';
import { en } from './en';
import { ja } from './ja';

export type Language = 'ko' | 'en' | 'ja';

export const languages = {
  ko,
  en,
  ja
};

export const languageNames = {
  ko: '한국어',
  en: 'English',
  ja: '日本語'
};

export type TranslationKeys = typeof ko;
