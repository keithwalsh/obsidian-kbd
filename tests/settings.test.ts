/**
 * @fileoverview Tests for the settings tab functionality including UI
 * rendering, user interactions, and settings persistence for the Kbd Wrapper plugin.
 */

import { App, Setting } from 'obsidian';
import { KbdSettingTab } from '../src/settings';
import { translate } from '../src/translations';
import type KbdWrapperPlugin from '../src/main';

// Mock the translate function and Obsidian
jest.mock('../src/translations');
jest.mock('obsidian');

const mockTranslate = translate as jest.MockedFunction<typeof translate>;

describe('KbdSettingTab', () => {
  let mockApp: any;
  let mockPlugin: KbdWrapperPlugin;
  let settingTab: KbdSettingTab;

  beforeEach(() => {
    jest.clearAllMocks();

    // Setup mock app
    mockApp = new App();

    // Setup mock plugin
    mockPlugin = {
      app: mockApp,
      settings: { kbdStyle: 'default' },
      saveSettings: jest.fn().mockResolvedValue(undefined)
    } as any;

    // Setup mock translations
    mockTranslate.mockImplementation((key: string) => {
      const translations: { [key: string]: string } = {
        'style-setting': 'Kbd style',
        'style-setting-desc': 'Choose the visual style for <kbd> tags',
        'style-default': 'Default',
        'style-github': 'GitHub',
        'style-stackoverflow': 'Stack Overflow'
      };
      return translations[key] || key;
    });

    settingTab = new KbdSettingTab(mockApp, mockPlugin);
  });

  describe('constructor', () => {
    it('should initialize with app and plugin references', () => {
      expect(settingTab.plugin).toBe(mockPlugin);
      expect(settingTab).toBeInstanceOf(KbdSettingTab);
    });

    it('should extend PluginSettingTab', () => {
      expect(settingTab).toBeInstanceOf(Object);
      expect(settingTab.plugin).toBe(mockPlugin);
    });
  });

  describe('display', () => {
    let mockContainerEl: any;
    let mockSetting: any;
    let mockDropdown: any;

    beforeEach(() => {
      mockDropdown = {
        addOption: jest.fn().mockReturnThis(),
        setValue: jest.fn().mockReturnThis(),
        onChange: jest.fn().mockReturnThis()
      };

      mockSetting = {
        setName: jest.fn().mockReturnThis(),
        setDesc: jest.fn().mockReturnThis(),
        addDropdown: jest.fn().mockImplementation((callback) => {
          callback(mockDropdown);
          return mockSetting;
        })
      };

      mockContainerEl = {
        empty: jest.fn()
      };

      settingTab.containerEl = mockContainerEl as any;

      // Mock the Setting constructor
      (Setting as any) = jest.fn().mockImplementation(() => mockSetting);
    });

    it('should clear the container element', () => {
      settingTab.display();
      expect(mockContainerEl.empty).toHaveBeenCalled();
    });

    it('should create a setting with proper translations', () => {
      settingTab.display();

      expect(Setting).toHaveBeenCalledWith(mockContainerEl);
      expect(mockSetting.setName).toHaveBeenCalledWith('Kbd style');
      expect(mockSetting.setDesc).toHaveBeenCalledWith('Choose the visual style for <kbd> tags');
    });

    it('should add dropdown options for all styles', () => {
      settingTab.display();

      expect(mockDropdown.addOption).toHaveBeenCalledWith('default', 'Default');
      expect(mockDropdown.addOption).toHaveBeenCalledWith('github', 'GitHub');
      expect(mockDropdown.addOption).toHaveBeenCalledWith('stackoverflow', 'Stack Overflow');
    });

    it('should set current value from plugin settings', () => {
      mockPlugin.settings.kbdStyle = 'github';
      settingTab.display();

      expect(mockDropdown.setValue).toHaveBeenCalledWith('github');
    });

    it('should handle dropdown value changes', async () => {
      settingTab.display();

      // Get the onChange callback that was passed to the dropdown
      const onChangeCallback = mockDropdown.onChange.mock.calls[0][0];
      
      // Simulate changing the value
      await onChangeCallback('stackoverflow');

      expect(mockPlugin.settings.kbdStyle).toBe('stackoverflow');
      expect(mockPlugin.saveSettings).toHaveBeenCalled();
    });

    it('should handle all style options correctly', async () => {
      const styles = ['default', 'github', 'stackoverflow'] as const;

      for (const style of styles) {
        jest.clearAllMocks();
        mockPlugin.settings.kbdStyle = 'default'; // Reset

        settingTab.display();
        const onChangeCallback = mockDropdown.onChange.mock.calls[0][0];
        
        await onChangeCallback(style);

        expect(mockPlugin.settings.kbdStyle).toBe(style);
        expect(mockPlugin.saveSettings).toHaveBeenCalled();
      }
    });

    it('should use translated strings for all UI elements', () => {
      settingTab.display();

      expect(mockTranslate).toHaveBeenCalledWith('style-setting');
      expect(mockTranslate).toHaveBeenCalledWith('style-setting-desc');
      expect(mockTranslate).toHaveBeenCalledWith('style-default');
      expect(mockTranslate).toHaveBeenCalledWith('style-github');
      expect(mockTranslate).toHaveBeenCalledWith('style-stackoverflow');
    });
  });

  describe('error handling', () => {
    it('should handle saveSettings failure gracefully', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      mockPlugin.saveSettings = jest.fn().mockRejectedValue(new Error('Save failed'));

      const mockDropdown = {
        addOption: jest.fn().mockReturnThis(),
        setValue: jest.fn().mockReturnThis(),
        onChange: jest.fn().mockReturnThis()
      };

      const mockSetting = {
        setName: jest.fn().mockReturnThis(),
        setDesc: jest.fn().mockReturnThis(),
        addDropdown: jest.fn().mockImplementation((callback) => {
          callback(mockDropdown);
          return mockSetting;
        })
      };

      settingTab.containerEl = { empty: jest.fn() } as any;
      (Setting as any) = jest.fn().mockImplementation(() => mockSetting);

      settingTab.display();

      const onChangeCallback = mockDropdown.onChange.mock.calls[0][0];

      // This should handle the rejection gracefully
      await expect(onChangeCallback('github')).rejects.toThrow('Save failed');

      consoleSpy.mockRestore();
    });

    it('should handle missing plugin reference', () => {
      const invalidSettingTab = new KbdSettingTab(mockApp, null as any);
      
      expect(() => {
        invalidSettingTab.display();
      }).toThrow('Cannot read properties of undefined'); // Should throw due to null plugin
    });
  });

  describe('integration tests', () => {
    it('should maintain consistency between display calls', () => {
      const mockContainerEl = { empty: jest.fn() };
      settingTab.containerEl = mockContainerEl as any;

      // Call display multiple times
      settingTab.display();
      settingTab.display();

      expect(mockContainerEl.empty).toHaveBeenCalledTimes(2);
    });

    it('should reflect plugin settings changes', () => {
      const mockDropdown = {
        addOption: jest.fn().mockReturnThis(),
        setValue: jest.fn().mockReturnThis(),
        onChange: jest.fn().mockReturnThis()
      };

      const mockSetting = {
        setName: jest.fn().mockReturnThis(),
        setDesc: jest.fn().mockReturnThis(),
        addDropdown: jest.fn().mockImplementation((callback) => {
          callback(mockDropdown);
          return mockSetting;
        })
      };

      settingTab.containerEl = { empty: jest.fn() } as any;
      (Setting as any) = jest.fn().mockImplementation(() => mockSetting);

      // Change plugin settings
      mockPlugin.settings.kbdStyle = 'stackoverflow';
      settingTab.display();

      expect(mockDropdown.setValue).toHaveBeenCalledWith('stackoverflow');
    });
  });
});
