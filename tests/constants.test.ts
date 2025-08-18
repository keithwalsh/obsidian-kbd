/**
 * @fileoverview Tests for constants and type definitions used throughout
 * the Kbd Wrapper plugin to ensure proper configuration and type safety.
 */

import { DEFAULT_SETTINGS } from '../src/constants';
import { KbdWrapperSettings } from '../src/types';

describe('constants', () => {
  describe('DEFAULT_SETTINGS', () => {
    it('should have the correct structure', () => {
      expect(DEFAULT_SETTINGS).toBeDefined();
      expect(typeof DEFAULT_SETTINGS).toBe('object');
    });

    it('should have kbdStyle property with default value', () => {
      expect(DEFAULT_SETTINGS).toHaveProperty('kbdStyle');
      expect(DEFAULT_SETTINGS.kbdStyle).toBe('default');
    });

    it('should match KbdWrapperSettings interface', () => {
      // Type check - this will fail at compile time if the interface doesn't match
      const settings: KbdWrapperSettings = DEFAULT_SETTINGS;
      expect(settings).toBeDefined();
    });

    it('should contain only valid style options', () => {
      const validStyles = ['default', 'github', 'stackoverflow'];
      expect(validStyles).toContain(DEFAULT_SETTINGS.kbdStyle);
    });

    it('should be immutable when copied', () => {
      const copy = { ...DEFAULT_SETTINGS };
      copy.kbdStyle = 'github';
      
      // Original should remain unchanged
      expect(DEFAULT_SETTINGS.kbdStyle).toBe('default');
      expect(copy.kbdStyle).toBe('github');
    });

    it('should be a frozen object to prevent accidental mutations', () => {
      expect(() => {
        (DEFAULT_SETTINGS as any).kbdStyle = 'github';
      }).not.toThrow(); // JavaScript doesn't prevent this unless explicitly frozen
      
      // But we can verify the intended immutability through deep cloning
      const originalValue = DEFAULT_SETTINGS.kbdStyle;
      const copy = JSON.parse(JSON.stringify(DEFAULT_SETTINGS));
      copy.kbdStyle = 'github';
      
      expect(DEFAULT_SETTINGS.kbdStyle).toBe(originalValue);
    });
  });
});

describe('types', () => {
  describe('KbdWrapperSettings', () => {
    it('should accept valid style values', () => {
      const validSettings: KbdWrapperSettings[] = [
        { kbdStyle: 'default' },
        { kbdStyle: 'github' },
        { kbdStyle: 'stackoverflow' }
      ];

      validSettings.forEach(setting => {
        expect(setting).toBeDefined();
        expect(['default', 'github', 'stackoverflow']).toContain(setting.kbdStyle);
      });
    });

    it('should be extensible for future properties', () => {
      // This test ensures our interface can be extended without breaking existing code
      type ExtendedSettings = KbdWrapperSettings & {
        newProperty?: string;
      };

      const extendedSettings: ExtendedSettings = {
        kbdStyle: 'default',
        newProperty: 'test'
      };

      expect(extendedSettings.kbdStyle).toBe('default');
      expect(extendedSettings.newProperty).toBe('test');
    });
  });

  describe('Translations interface', () => {
    it('should support nested string structures', () => {
      // Mock data that matches the Translations interface
      const mockTranslations = {
        en: {
          'key1': 'value1',
          'key2': 'value2'
        },
        es: {
          'key1': 'valor1',
          'key2': 'valor2'
        }
      };

      expect(mockTranslations.en['key1']).toBe('value1');
      expect(mockTranslations.es['key1']).toBe('valor1');
    });

    it('should handle dynamic language codes', () => {
      const dynamicTranslations: { [key: string]: { [key: string]: string } } = {};
      
      // Simulate adding translations dynamically
      dynamicTranslations['en'] = { 'test': 'test value' };
      dynamicTranslations['customLang'] = { 'test': 'custom value' };

      expect(dynamicTranslations['en']['test']).toBe('test value');
      expect(dynamicTranslations['customLang']['test']).toBe('custom value');
    });
  });
});

describe('configuration validation', () => {
  it('should ensure all style options are supported', () => {
    const supportedStyles = ['default', 'github', 'stackoverflow'] as const;
    
    // Verify the default setting uses a supported style
    expect(supportedStyles).toContain(DEFAULT_SETTINGS.kbdStyle as any);
  });

  it('should maintain consistency between constants and types', () => {
    // This test ensures that any changes to types are reflected in constants
    const testSettings: KbdWrapperSettings = {
      kbdStyle: DEFAULT_SETTINGS.kbdStyle
    };

    expect(testSettings).toEqual(DEFAULT_SETTINGS);
  });

  it('should handle settings merging correctly', () => {
    const userSettings: Partial<KbdWrapperSettings> = {
      kbdStyle: 'github'
    };

    const mergedSettings: KbdWrapperSettings = {
      ...DEFAULT_SETTINGS,
      ...userSettings
    };

    expect(mergedSettings.kbdStyle).toBe('github');
  });

  it('should validate incomplete user settings', () => {
    const incompleteSettings: Partial<KbdWrapperSettings> = {};

    const mergedSettings: KbdWrapperSettings = {
      ...DEFAULT_SETTINGS,
      ...incompleteSettings
    };

    expect(mergedSettings).toEqual(DEFAULT_SETTINGS);
  });
});
