/**
 * @fileoverview Internationalization support for the Kbd plugin. Provides
 * translations in multiple languages and utilities for locale detection and
 * text translation with fallback mechanisms.
 */

import { getLanguage } from 'obsidian';
import { Translations } from './types';

/**
 * Translation strings organized by language code.
 * Supports multiple languages with English as the fallback language.
 * Each language object contains key-value pairs for UI text elements.
 */
export const translations: Translations = {
  en: {
    'select-text-notice': 'Please select text to wrap in <kbd> tags.',
    'menu-item-title': '<kbd>',
    'settings-title': 'Kbd style settings',
    'style-setting': 'Kbd style',
    'style-setting-desc': 'Choose the visual style for <kbd> tags',
    'style-default': 'Default',
    'style-github': 'GitHub',
    'style-stackoverflow': 'Stack Overflow',
  },
  es: {
    'select-text-notice': 'Por favor selecciona texto para envolver en etiquetas <kbd>.',
    'menu-item-title': '<kbd>',
    'settings-title': 'Configuración de Estilo Kbd',
    'style-setting': 'Estilo Kbd',
    'style-setting-desc': 'Elige el estilo visual para las etiquetas <kbd>',
    'style-default': 'Predeterminado',
    'style-github': 'GitHub',
    'style-stackoverflow': 'Stack Overflow',
  },
  fr: {
    'select-text-notice': 'Veuillez sélectionner du texte à envelopper dans les balises <kbd>.',
    'menu-item-title': '<kbd>',
    'settings-title': 'Paramètres de Style Kbd',
    'style-setting': 'Style Kbd',
    'style-setting-desc': 'Choisissez le style visuel pour les balises <kbd>',
    'style-default': 'Par défaut',
    'style-github': 'GitHub',
    'style-stackoverflow': 'Stack Overflow',
  },
  de: {
    'select-text-notice': 'Bitte wählen Sie Text aus, um ihn in <kbd>-Tags zu verpacken.',
    'menu-item-title': '<kbd>',
    'settings-title': 'Kbd-Stil-Einstellungen',
    'style-setting': 'Kbd-Stil',
    'style-setting-desc': 'Wählen Sie den visuellen Stil für <kbd>-Tags',
    'style-default': 'Standard',
    'style-github': 'GitHub',
    'style-stackoverflow': 'Stack Overflow',
  },
  it: {
    'select-text-notice': 'Seleziona il testo da avvolgere nei tag <kbd>.',
    'menu-item-title': '<kbd>',
    'settings-title': 'Impostazioni Stile Kbd',
    'style-setting': 'Stile Kbd',
    'style-setting-desc': 'Scegli lo stile visivo per i tag <kbd>',
    'style-default': 'Predefinito',
    'style-github': 'GitHub',
    'style-stackoverflow': 'Stack Overflow',
  },
  pt: {
    'select-text-notice': 'Selecione o texto para envolver em tags <kbd>.',
    'menu-item-title': '<kbd>',
    'settings-title': 'Configurações de Estilo Kbd',
    'style-setting': 'Estilo Kbd',
    'style-setting-desc': 'Escolha o estilo visual para tags <kbd>',
    'style-default': 'Padrão',
    'style-github': 'GitHub',
    'style-stackoverflow': 'Stack Overflow',
  },
  ru: {
    'select-text-notice': 'Пожалуйста, выберите текст для обертывания в теги <kbd>.',
    'menu-item-title': '<kbd>',
    'settings-title': 'Настройки Стиля Kbd',
    'style-setting': 'Стиль Kbd',
    'style-setting-desc': 'Выберите визуальный стиль для тегов <kbd>',
    'style-default': 'По умолчанию',
    'style-github': 'GitHub',
    'style-stackoverflow': 'Stack Overflow',
  },
  zh: {
    'select-text-notice': '请选择要用 <kbd> 标签包装的文本。',
    'menu-item-title': '<kbd>',
    'settings-title': 'Kbd 样式设置',
    'style-setting': 'Kbd 样式',
    'style-setting-desc': '选择 <kbd> 标签的视觉样式',
    'style-default': '默认',
    'style-github': 'GitHub',
    'style-stackoverflow': 'Stack Overflow',
  },
  ja: {
    'select-text-notice': '<kbd>タグで囲むテキストを選択してください。',
    'menu-item-title': '<kbd>',
    'settings-title': 'Kbd スタイル設定',
    'style-setting': 'Kbd スタイル',
    'style-setting-desc': '<kbd>タグの視覚スタイルを選択',
    'style-default': 'デフォルト',
    'style-github': 'GitHub',
    'style-stackoverflow': 'Stack Overflow',
  },
  ko: {
    'select-text-notice': '<kbd> 태그로 감쌀 텍스트를 선택하세요.',
    'menu-item-title': '<kbd>',
    'settings-title': 'Kbd 스타일 설정',
    'style-setting': 'Kbd 스타일',
    'style-setting-desc': '<kbd> 태그의 시각적 스타일 선택',
    'style-default': '기본값',
    'style-github': 'GitHub',
    'style-stackoverflow': 'Stack Overflow',
  },
};

/**
 * Detects the current user's locale preference.
 * Uses Obsidian's getLanguage API to retrieve the language configured in
 * application settings and defaults to English if unsupported.
 * 
 * @returns {string} Two-letter language code (e.g., 'en', 'es', 'fr')
 */
export function getCurrentLocale(): string {
  const language = getLanguage();
  const locale = language?.substring(0, 2) || 'en';
  return translations[locale] ? locale : 'en';
}

/**
 * Translates a key to the current locale's text.
 * Falls back to English if the key is not found in the current locale,
 * and returns the key itself if not found in any locale.
 * 
 * @param {string} key - The translation key to look up
 * @returns {string} The translated text or the key if no translation exists
 */
export function translate(key: string): string {
  const locale = getCurrentLocale();
  return translations[locale]?.[key] || translations['en'][key] || key;
} 