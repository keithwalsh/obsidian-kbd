/**
 * @fileoverview Tests for translation functionality including locale detection,
 * translation key lookup, and fallback mechanisms for the Kbd Wrapper plugin.
 */

import { getLanguage } from 'obsidian';
import { translations, getCurrentLocale, translate } from '../src/translations';

// Mock the getLanguage function
jest.mock('obsidian');
const mockGetLanguage = getLanguage as jest.MockedFunction<typeof getLanguage>;

describe('translations', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('translations object', () => {
    it('should contain all required languages', () => {
      const expectedLanguages = ['en', 'es', 'fr', 'de', 'it', 'pt', 'ru', 'zh', 'ja', 'ko'];
      expectedLanguages.forEach(lang => {
        expect(translations).toHaveProperty(lang);
      });
    });

    it('should have consistent keys across all languages', () => {
      const expectedKeys = [
        'select-text-notice',
        'menu-item-title',
        'style-setting',
        'style-setting-desc',
        'style-default',
        'style-github',
        'style-stackoverflow'
      ];

      Object.keys(translations).forEach(lang => {
        expectedKeys.forEach(key => {
          expect(translations[lang]).toHaveProperty(key);
          expect(typeof translations[lang][key]).toBe('string');
          expect(translations[lang][key].length).toBeGreaterThan(0);
        });
      });
    });

    it('should have non-empty translation values', () => {
      Object.entries(translations).forEach(([lang, langTranslations]) => {
        Object.entries(langTranslations).forEach(([key, value]) => {
          expect(value).toBeTruthy();
          expect(typeof value).toBe('string');
        });
      });
    });
  });

  describe('getCurrentLocale', () => {
    it('should return "en" when getLanguage returns undefined', () => {
      mockGetLanguage.mockReturnValue(undefined as any);
      expect(getCurrentLocale()).toBe('en');
    });

    it('should return "en" when getLanguage returns null', () => {
      mockGetLanguage.mockReturnValue(null as any);
      expect(getCurrentLocale()).toBe('en');
    });

    it('should extract two-letter locale from full language code', () => {
      mockGetLanguage.mockReturnValue('en-US');
      expect(getCurrentLocale()).toBe('en');

      mockGetLanguage.mockReturnValue('es-ES');
      expect(getCurrentLocale()).toBe('es');

      mockGetLanguage.mockReturnValue('fr-FR');
      expect(getCurrentLocale()).toBe('fr');
    });

    it('should return supported locale when available', () => {
      mockGetLanguage.mockReturnValue('de');
      expect(getCurrentLocale()).toBe('de');

      mockGetLanguage.mockReturnValue('ja');
      expect(getCurrentLocale()).toBe('ja');
    });

    it('should fallback to "en" for unsupported locales', () => {
      mockGetLanguage.mockReturnValue('xx');
      expect(getCurrentLocale()).toBe('en');

      mockGetLanguage.mockReturnValue('unsupported-locale');
      expect(getCurrentLocale()).toBe('en');
    });

    it('should handle edge cases with empty strings', () => {
      mockGetLanguage.mockReturnValue('');
      expect(getCurrentLocale()).toBe('en');
    });
  });

  describe('translate', () => {
    beforeEach(() => {
      // Default to English for most tests
      mockGetLanguage.mockReturnValue('en');
    });

    it('should return translated text for valid keys', () => {
      expect(translate('select-text-notice')).toBe('Please select text to wrap in <kbd> tags.');
      expect(translate('menu-item-title')).toBe('<kbd>');
      expect(translate('style-setting')).toBe('Kbd style');
    });

    it('should return translated text in different languages', () => {
      mockGetLanguage.mockReturnValue('es');
      expect(translate('select-text-notice')).toBe('Por favor selecciona texto para envolver en etiquetas <kbd>.');

      mockGetLanguage.mockReturnValue('fr');
      expect(translate('style-setting')).toBe('Style Kbd');

      mockGetLanguage.mockReturnValue('de');
      expect(translate('style-default')).toBe('Standard');
    });

    it('should fallback to English when key not found in current locale', () => {
      // Mock a scenario where the current locale doesn't have the key
      const originalTranslations = { ...translations.es };
      delete translations.es['select-text-notice'];

      mockGetLanguage.mockReturnValue('es');
      expect(translate('select-text-notice')).toBe('Please select text to wrap in <kbd> tags.');

      // Restore original translations
      translations.es['select-text-notice'] = originalTranslations['select-text-notice'];
    });

    it('should return the key itself when not found in any locale', () => {
      expect(translate('non-existent-key')).toBe('non-existent-key');
      expect(translate('another-missing-key')).toBe('another-missing-key');
    });

    it('should handle empty or undefined keys gracefully', () => {
      expect(translate('')).toBe('');
      expect(translate(undefined as any)).toBe(undefined);
    });

    it('should work with all supported style options', () => {
      const styleKeys = ['style-default', 'style-github', 'style-stackoverflow'];
      
      styleKeys.forEach(key => {
        const translation = translate(key);
        expect(typeof translation).toBe('string');
        expect(translation.length).toBeGreaterThan(0);
      });
    });

    it('should preserve special characters in translations', () => {
      const translation = translate('menu-item-title');
      expect(translation).toContain('<kbd>');
      
      const noticeTranslation = translate('select-text-notice');
      expect(noticeTranslation).toContain('<kbd>');
    });
  });

  describe('integration tests', () => {
    it('should work correctly with rapid locale changes', () => {
      mockGetLanguage.mockReturnValue('en');
      expect(translate('style-setting')).toBe('Kbd style');

      mockGetLanguage.mockReturnValue('es');
      expect(translate('style-setting')).toBe('Estilo Kbd');

      mockGetLanguage.mockReturnValue('ja');
      expect(translate('style-setting')).toBe('Kbd スタイル');
    });

    it('should maintain consistency across multiple translation calls', () => {
      mockGetLanguage.mockReturnValue('fr');
      
      const firstCall = translate('style-setting-desc');
      const secondCall = translate('style-setting-desc');
      
      expect(firstCall).toBe(secondCall);
      expect(firstCall).toBe('Choisissez le style visuel pour les balises <kbd>');
    });
  });
});
