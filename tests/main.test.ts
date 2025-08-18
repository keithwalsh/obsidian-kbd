/**
 * @fileoverview Tests for the main plugin functionality including kbd tag
 * wrapping/unwrapping, editor interactions, and plugin lifecycle management
 * for the Kbd Wrapper plugin.
 */

import { Editor, Notice, Menu } from 'obsidian';
import KbdWrapperPlugin from '../src/main';
import { translate } from '../src/translations';
import { DEFAULT_SETTINGS } from '../src/constants';

// Mock dependencies
jest.mock('../src/translations');
jest.mock('obsidian');

const mockTranslate = translate as jest.MockedFunction<typeof translate>;
const mockNotice = Notice as jest.MockedClass<typeof Notice>;

describe('KbdWrapperPlugin', () => {
  let plugin: KbdWrapperPlugin;
  let mockApp: any;

  beforeEach(() => {
    jest.clearAllMocks();

    // Setup translation mock
    mockTranslate.mockImplementation((key: string) => {
      const translations: { [key: string]: string } = {
        'select-text-notice': 'Please select text to wrap in <kbd> tags.',
        'menu-item-title': '<kbd>'
      };
      return translations[key] || key;
    });

    // Setup mock app
    mockApp = {
      workspace: {
        on: jest.fn()
      }
    };

    // Create plugin instance
    plugin = new (KbdWrapperPlugin as any)();
    plugin.app = mockApp;
    plugin.settings = { ...DEFAULT_SETTINGS };

    // Mock plugin methods
    plugin.addCommand = jest.fn();
    plugin.addSettingTab = jest.fn();
    plugin.registerEvent = jest.fn();
    plugin.loadData = jest.fn().mockResolvedValue({});
    plugin.saveData = jest.fn().mockResolvedValue(undefined);

    // Mock document.body
    document.body.classList.add = jest.fn();
    document.body.classList.remove = jest.fn();
  });

  describe('plugin lifecycle', () => {
    describe('onload', () => {
      it('should load settings on initialization', async () => {
        await plugin.onload();
        expect(plugin.loadData).toHaveBeenCalled();
      });

      it('should apply initial kbd style', async () => {
        await plugin.onload();
        expect(document.body.classList.add).toHaveBeenCalledWith('kbd-style-default');
      });

      it('should register the wrap command', async () => {
        await plugin.onload();
        expect(plugin.addCommand).toHaveBeenCalledWith({
          id: 'wrap-selection-with-kbd',
          name: 'Wrap selection with <kbd>',
          editorCallback: expect.any(Function)
        });
      });

      it('should register editor context menu', async () => {
        await plugin.onload();
        expect(plugin.registerEvent).toHaveBeenCalled();
        expect(mockApp.workspace.on).toHaveBeenCalledWith('editor-menu', expect.any(Function));
      });

      it('should add settings tab', async () => {
        await plugin.onload();
        expect(plugin.addSettingTab).toHaveBeenCalled();
      });
    });

    describe('onunload', () => {
      it('should remove all style classes', () => {
        plugin.onunload();
        expect(document.body.classList.remove).toHaveBeenCalledWith(
          'kbd-style-default',
          'kbd-style-github',
          'kbd-style-stackoverflow'
        );
      });
    });

    describe('loadSettings', () => {
      it('should merge saved settings with defaults', async () => {
        const savedSettings = { kbdStyle: 'github' as const };
        plugin.loadData = jest.fn().mockResolvedValue(savedSettings);

        await plugin.loadSettings();

        expect(plugin.settings).toEqual({
          ...DEFAULT_SETTINGS,
          ...savedSettings
        });
      });

      it('should use defaults when no saved settings exist', async () => {
        plugin.loadData = jest.fn().mockResolvedValue({});

        await plugin.loadSettings();

        expect(plugin.settings).toEqual(DEFAULT_SETTINGS);
      });
    });

    describe('saveSettings', () => {
      it('should save settings data', async () => {
        plugin.settings.kbdStyle = 'github';
        await plugin.saveSettings();
        expect(plugin.saveData).toHaveBeenCalledWith(plugin.settings);
      });

      it('should apply style after saving', async () => {
        plugin.settings.kbdStyle = 'github';
        await plugin.saveSettings();
        expect(document.body.classList.remove).toHaveBeenCalled();
        expect(document.body.classList.add).toHaveBeenCalledWith('kbd-style-github');
      });
    });

    describe('applyKbdStyle', () => {
      it('should remove all existing style classes', () => {
        (plugin as any).applyKbdStyle();
        expect(document.body.classList.remove).toHaveBeenCalledWith(
          'kbd-style-default',
          'kbd-style-github',
          'kbd-style-stackoverflow'
        );
      });

      it('should apply the selected style class', () => {
        plugin.settings.kbdStyle = 'stackoverflow';
        (plugin as any).applyKbdStyle();
        expect(document.body.classList.add).toHaveBeenCalledWith('kbd-style-stackoverflow');
      });
    });
  });

  describe('kbd wrapping functionality', () => {
    let mockEditor: any;

    beforeEach(() => {
      mockEditor = {
        listSelections: jest.fn(),
        getRange: jest.fn(),
        replaceRange: jest.fn(),
        posToOffset: jest.fn(),
        offsetToPos: jest.fn(),
        getLine: jest.fn()
      } as any;
    });

    describe('with text selection', () => {
      it('should wrap plain text with kbd tags', () => {
        const selections = [{
          anchor: { line: 0, ch: 0 },
          head: { line: 0, ch: 5 }
        }];

        mockEditor.listSelections = jest.fn().mockReturnValue(selections);
        mockEditor.getRange = jest.fn().mockReturnValue('hello');

        (plugin as any).wrapSelectionWithKbd(mockEditor);

        expect(mockEditor.replaceRange).toHaveBeenCalledWith(
          '<kbd>hello</kbd>',
          { line: 0, ch: 0 },
          { line: 0, ch: 5 }
        );
      });

      it('should unwrap text already wrapped with kbd tags', () => {
        const selections = [{
          anchor: { line: 0, ch: 0 },
          head: { line: 0, ch: 16 }
        }];

        mockEditor.listSelections = jest.fn().mockReturnValue(selections);
        mockEditor.getRange = jest.fn().mockReturnValue('<kbd>hello</kbd>');

        (plugin as any).wrapSelectionWithKbd(mockEditor);

        expect(mockEditor.replaceRange).toHaveBeenCalledWith(
          'hello',
          { line: 0, ch: 0 },
          { line: 0, ch: 16 }
        );
      });

      it('should unwrap text inside kbd tags when selection is inside', () => {
        const selections = [{
          anchor: { line: 0, ch: 5 },
          head: { line: 0, ch: 10 }
        }];

        mockEditor.listSelections = jest.fn().mockReturnValue(selections);
        mockEditor.getRange = jest.fn()
          .mockReturnValueOnce('hello') // Selected text
          .mockReturnValueOnce('<kbd>') // Before selection
          .mockReturnValueOnce('</kbd>'); // After selection

        mockEditor.posToOffset = jest.fn()
          .mockReturnValueOnce(5) // fromOffset
          .mockReturnValueOnce(10); // toOffset

        mockEditor.offsetToPos = jest.fn()
          .mockReturnValueOnce({ line: 0, ch: 0 }) // offsetToPos(fromOffset - 5) for before check
          .mockReturnValueOnce({ line: 0, ch: 16 }) // offsetToPos(toOffset + 6) for after check  
          .mockReturnValueOnce({ line: 0, ch: 0 }) // offsetToPos(fromOffset - 5) for replace start
          .mockReturnValueOnce({ line: 0, ch: 16 }); // offsetToPos(toOffset + 6) for replace end

        (plugin as any).wrapSelectionWithKbd(mockEditor);

        expect(mockEditor.replaceRange).toHaveBeenCalledWith(
          'hello',
          { line: 0, ch: 0 },
          { line: 0, ch: 16 }
        );
      });

      it('should handle multiple selections in reverse order', () => {
        const selections = [
          { anchor: { line: 0, ch: 0 }, head: { line: 0, ch: 5 } },
          { anchor: { line: 0, ch: 10 }, head: { line: 0, ch: 15 } }
        ];

        mockEditor.listSelections = jest.fn().mockReturnValue(selections);
        mockEditor.getRange = jest.fn()
          .mockReturnValueOnce('world') // Second selection (processed first due to reverse)
          .mockReturnValueOnce('hello'); // First selection

        (plugin as any).wrapSelectionWithKbd(mockEditor);

        expect(mockEditor.replaceRange).toHaveBeenCalledTimes(2);
        expect(mockEditor.replaceRange).toHaveBeenNthCalledWith(1,
          '<kbd>world</kbd>',
          { line: 0, ch: 10 },
          { line: 0, ch: 15 }
        );
        expect(mockEditor.replaceRange).toHaveBeenNthCalledWith(2,
          '<kbd>hello</kbd>',
          { line: 0, ch: 0 },
          { line: 0, ch: 5 }
        );
      });

      it('should handle reversed selections correctly', () => {
        const selections = [{
          anchor: { line: 0, ch: 5 }, // End position
          head: { line: 0, ch: 0 }    // Start position
        }];

        mockEditor.listSelections = jest.fn().mockReturnValue(selections);
        mockEditor.getRange = jest.fn().mockReturnValue('hello');

        (plugin as any).wrapSelectionWithKbd(mockEditor);

        expect(mockEditor.replaceRange).toHaveBeenCalledWith(
          '<kbd>hello</kbd>',
          { line: 0, ch: 0 }, // Normalized start
          { line: 0, ch: 5 }  // Normalized end
        );
      });
    });

    describe('without text selection (cursor only)', () => {
      it('should unwrap kbd tags when cursor is inside them', () => {
        const selections = [{
          anchor: { line: 0, ch: 7 },
          head: { line: 0, ch: 7 }
        }];

        mockEditor.listSelections = jest.fn().mockReturnValue(selections);
        mockEditor.getRange = jest.fn().mockReturnValue(''); // No selection
        mockEditor.getLine = jest.fn().mockReturnValue('Some <kbd>text</kbd> here');

        (plugin as any).wrapSelectionWithKbd(mockEditor);

        expect(mockEditor.replaceRange).toHaveBeenCalledWith(
          'text',
          { line: 0, ch: 5 },
          { line: 0, ch: 20 }
        );
      });

      it('should show notice when cursor is not inside kbd tags', () => {
        const selections = [{
          anchor: { line: 0, ch: 0 },
          head: { line: 0, ch: 0 }
        }];

        mockEditor.listSelections = jest.fn().mockReturnValue(selections);
        mockEditor.getRange = jest.fn().mockReturnValue(''); // No selection
        mockEditor.getLine = jest.fn().mockReturnValue('Plain text without kbd tags');

        (plugin as any).wrapSelectionWithKbd(mockEditor);

        expect(mockNotice).toHaveBeenCalledWith('Please select text to wrap in <kbd> tags.');
      });

      it('should handle multiple kbd tags on the same line', () => {
        const selections = [{
          anchor: { line: 0, ch: 28 },
          head: { line: 0, ch: 28 }
        }];

        mockEditor.listSelections = jest.fn().mockReturnValue(selections);
        mockEditor.getRange = jest.fn().mockReturnValue(''); // No selection
        mockEditor.getLine = jest.fn().mockReturnValue('<kbd>first</kbd> and <kbd>second</kbd>');

        (plugin as any).wrapSelectionWithKbd(mockEditor);

        expect(mockEditor.replaceRange).toHaveBeenCalledWith(
          'second',
          { line: 0, ch: 21 },
          { line: 0, ch: 38 }
        );
      });
    });

    describe('edge cases', () => {
      it('should handle empty selections gracefully', () => {
        mockEditor.listSelections = jest.fn().mockReturnValue([]);

        (plugin as any).wrapSelectionWithKbd(mockEditor);

        expect(mockNotice).toHaveBeenCalledWith('Please select text to wrap in <kbd> tags.');
      });

      it('should handle selections with zero length', () => {
        const selections = [{
          anchor: { line: 0, ch: 5 },
          head: { line: 0, ch: 5 }
        }];

        mockEditor.listSelections = jest.fn().mockReturnValue(selections);
        mockEditor.getRange = jest.fn().mockReturnValue('');
        mockEditor.getLine = jest.fn().mockReturnValue('Plain text');

        (plugin as any).wrapSelectionWithKbd(mockEditor);

        expect(mockNotice).toHaveBeenCalledWith('Please select text to wrap in <kbd> tags.');
      });

      it('should handle malformed kbd tags gracefully', () => {
        const selections = [{
          anchor: { line: 0, ch: 7 },
          head: { line: 0, ch: 7 }
        }];

        mockEditor.listSelections = jest.fn().mockReturnValue(selections);
        mockEditor.getRange = jest.fn().mockReturnValue('');
        mockEditor.getLine = jest.fn().mockReturnValue('<kbd>unclosed tag');

        (plugin as any).wrapSelectionWithKbd(mockEditor);

        expect(mockNotice).toHaveBeenCalledWith('Please select text to wrap in <kbd> tags.');
      });

      it('should handle nested kbd tags correctly', () => {
        const selections = [{
          anchor: { line: 0, ch: 0 },
          head: { line: 0, ch: 22 }
        }];

        mockEditor.listSelections = jest.fn().mockReturnValue(selections);
        mockEditor.getRange = jest.fn().mockReturnValue('<kbd>nested</kbd>');

        (plugin as any).wrapSelectionWithKbd(mockEditor);

        expect(mockEditor.replaceRange).toHaveBeenCalledWith(
          'nested',
          { line: 0, ch: 0 },
          { line: 0, ch: 22 }
        );
      });
    });
  });

  describe('context menu integration', () => {
    it('should add context menu item when editor menu event fires', async () => {
      await plugin.onload();

      const menuCallback = mockApp.workspace.on.mock.calls[0][1];
      const mockMenu = {
        addSeparator: jest.fn(),
        addItem: jest.fn()
      };
      const mockEditor = {} as any;

      menuCallback(mockMenu, mockEditor);

      expect(mockMenu.addSeparator).toHaveBeenCalled();
      expect(mockMenu.addItem).toHaveBeenCalledWith(expect.any(Function));
    });

    it('should configure context menu item correctly', async () => {
      await plugin.onload();

      const menuCallback = mockApp.workspace.on.mock.calls[0][1];
      const mockMenu = {
        addSeparator: jest.fn(),
        addItem: jest.fn()
      };
      const mockEditor = {} as any;

      menuCallback(mockMenu, mockEditor);

      const itemConfigCallback = mockMenu.addItem.mock.calls[0][0];
      const mockItem = {
        setTitle: jest.fn().mockReturnThis(),
        setIcon: jest.fn().mockReturnThis(),
        onClick: jest.fn().mockReturnThis()
      };

      itemConfigCallback(mockItem);

      expect(mockItem.setTitle).toHaveBeenCalledWith('<kbd>');
      expect(mockItem.setIcon).toHaveBeenCalledWith('keyboard');
      expect(mockItem.onClick).toHaveBeenCalledWith(expect.any(Function));
    });
  });
});
