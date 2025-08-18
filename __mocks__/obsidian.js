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
  
  Editor: class MockEditor {
    constructor() {
      this.listSelections = jest.fn().mockReturnValue([]);
      this.getRange = jest.fn().mockReturnValue('');
      this.replaceRange = jest.fn();
      this.posToOffset = jest.fn().mockReturnValue(0);
      this.offsetToPos = jest.fn().mockReturnValue({ line: 0, ch: 0 });
      this.getLine = jest.fn().mockReturnValue('');
    }
  },
  
  Notice: jest.fn(),
  
  Menu: class MockMenu {
    constructor() {
      this.addSeparator = jest.fn();
      this.addItem = jest.fn();
    }
  },
  
  App: class MockApp {
    constructor() {
      this.workspace = {
        on: jest.fn()
      };
    }
  },
  
  PluginSettingTab: class MockPluginSettingTab {
    constructor(app, plugin) {
      this.app = app;
      this.plugin = plugin;
      this.containerEl = {
        empty: jest.fn()
      };
    }
  },
  
  Setting: class MockSetting {
    constructor(containerEl) {
      this.containerEl = containerEl;
    }
    
    setName = jest.fn().mockReturnThis();
    setDesc = jest.fn().mockReturnThis();
    addDropdown = jest.fn().mockReturnThis();
  },
  
  getLanguage: jest.fn().mockReturnValue('en')
};
