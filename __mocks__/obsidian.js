/**
 * @fileoverview Manual mock for Obsidian API to enable testing without
 * requiring the actual Obsidian environment. Provides mock implementations
 * of core Obsidian classes and functions.
 */

module.exports = {
  Plugin: class MockPlugin {
    constructor() {
      this.app = null;
      this.settings = {};
    }
    
    addCommand = jest.fn();
    addSettingTab = jest.fn();
    registerEvent = jest.fn();
    loadData = jest.fn().mockResolvedValue({});
    saveData = jest.fn().mockResolvedValue(undefined);
  },
  
  Editor: jest.fn().mockImplementation(() => ({
    listSelections: jest.fn().mockReturnValue([]),
    getRange: jest.fn().mockReturnValue(''),
    replaceRange: jest.fn(),
    posToOffset: jest.fn().mockReturnValue(0),
    offsetToPos: jest.fn().mockReturnValue({ line: 0, ch: 0 }),
    getLine: jest.fn().mockReturnValue('')
  })),
  
  Notice: jest.fn(),
  
  Menu: jest.fn().mockImplementation(() => ({
    addSeparator: jest.fn(),
    addItem: jest.fn()
  })),
  
  App: jest.fn().mockImplementation(() => ({
    workspace: {
      on: jest.fn()
    }
  })),
  
  PluginSettingTab: class MockPluginSettingTab {
    constructor(app, plugin) {
      this.app = app;
      this.plugin = plugin;
      this.containerEl = {
        empty: jest.fn()
      };
    }
    
    display() {
      // Base implementation - should be overridden by subclasses
    }
  },
  
  Setting: jest.fn().mockImplementation((containerEl) => {
    const mockSetting = {
      containerEl,
      setName: jest.fn(),
      setDesc: jest.fn(),
      addDropdown: jest.fn()
    };
    // Make methods chainable by returning the mock instance
    mockSetting.setName.mockReturnValue(mockSetting);
    mockSetting.setDesc.mockReturnValue(mockSetting);
    mockSetting.addDropdown.mockReturnValue(mockSetting);
    return mockSetting;
  }),
  
  getLanguage: jest.fn().mockReturnValue('en')
};
