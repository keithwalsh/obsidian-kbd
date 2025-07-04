/**
 * @fileoverview Main plugin implementation for the Kbd Wrapper plugin.
 * Provides functionality to wrap selected text with HTML kbd tags and manages
 * plugin settings, styling, and user interactions within Obsidian.
 */

import { Plugin, Editor, Notice, Menu } from 'obsidian';
import { KbdWrapperSettings } from './types';
import { DEFAULT_SETTINGS } from './constants';
import { translate } from './translations';
import { KbdSettingTab } from './settings';

/**
 * Main plugin class that extends Obsidian's Plugin base class.
 * Handles kbd tag wrapping/unwrapping functionality and manages plugin lifecycle.
 */
export default class KbdWrapperPlugin extends Plugin {
  /** Plugin settings with default values applied */
  settings: KbdWrapperSettings = DEFAULT_SETTINGS;

  /**
   * Wraps selected text with kbd tags or unwraps existing kbd tags.
   * Handles multiple selection scenarios:
   * - Selection already wrapped with kbd tags: unwraps them
   * - Selection inside existing kbd tags: removes the surrounding tags
   * - Plain text selection: wraps with kbd tags
   * - No selection with cursor inside kbd tags: unwraps the kbd at cursor
   * - No selection and cursor not in kbd tags: shows notice
   * 
   * @param editor - The Obsidian editor instance
   */
  private wrapSelectionWithKbd(editor: Editor): void {
    const selections = editor.listSelections();

    // Helper to compare positions so we can get consistent (from, to) pairs
    const isBefore = (a: { line: number; ch: number }, b: { line: number; ch: number }): boolean => {
      return a.line < b.line || (a.line === b.line && a.ch <= b.ch);
    };

    // Flag to know if we performed an action – if not we will show the notice at the end
    let didSomething = false;

    // Process selections in reverse order to avoid position shifts when we replace text
    selections
      .slice() // clone array so original order is preserved elsewhere
      .reverse()
      .forEach((sel) => {
        // Normalise selection direction
        const from = isBefore(sel.anchor, sel.head) ? sel.anchor : sel.head;
        const to = isBefore(sel.anchor, sel.head) ? sel.head : sel.anchor;

        const selectedText = editor.getRange(from, to);
        const hasSelection = selectedText.length > 0;

        // 1. If there IS a textual selection
        if (hasSelection) {
          // Case 1a: selection itself already includes the <kbd> tags → unwrap directly
          if (selectedText.startsWith('<kbd>') && selectedText.endsWith('</kbd>')) {
            const unwrapped = selectedText.slice(5, -6);
            editor.replaceRange(unwrapped, from, to);
            didSomething = true;
            return;
          }

          // Case 1b: selection is INSIDE existing <kbd> … </kbd> tags (tags not selected)
          // We need to check the 5 chars before `from` and 6 chars after `to`.
          const posToOffset = editor.posToOffset.bind(editor);
          const offsetToPos = editor.offsetToPos.bind(editor);

          const fromOffset = posToOffset(from);
          const toOffset = posToOffset(to);

          if (fromOffset >= 5) {
            const before = editor.getRange(
              offsetToPos(fromOffset - 5),
              from
            );
            const after = editor.getRange(
              to,
              offsetToPos(toOffset + 6)
            );

            if (before === '<kbd>' && after === '</kbd>') {
              // Remove the surrounding tags entirely
              editor.replaceRange(selectedText, offsetToPos(fromOffset - 5), offsetToPos(toOffset + 6));
              didSomething = true;
              return;
            }
          }

          // Otherwise → wrap the selection
          editor.replaceRange(`<kbd>${selectedText}</kbd>`, from, to);
          didSomething = true;
          return;
        }

        // 2. No selection – just a cursor. Check if cursor is inside <kbd> … </kbd>
        const cursor = from; // since from === to when no selection
        const lineText = editor.getLine(cursor.line);
        const regex = /<kbd>(.*?)<\/kbd>/g;
        let match: RegExpExecArray | null;
        while ((match = regex.exec(lineText)) !== null) {
          const matchStart = match.index;
          const matchEnd = match.index + match[0].length;
          if (cursor.ch >= matchStart && cursor.ch <= matchEnd) {
            // Cursor is inside this kbd – unwrap it
            const startPos = { line: cursor.line, ch: matchStart };
            const endPos = { line: cursor.line, ch: matchEnd };
            editor.replaceRange(match[1], startPos, endPos);
            didSomething = true;
            break;
          }
        }
      });

    if (!didSomething) {
      // No selection or cursor inside <kbd> → show notice
      new Notice(translate('select-text-notice'));
    }
  }

  /**
   * Plugin initialization method called when the plugin is loaded.
   * Sets up commands, context menu items, settings tab, and applies initial styling.
   */
  async onload() {
    await this.loadSettings();

    // Apply the current style
    this.applyKbdStyle();

    // Add command
    this.addCommand({
      id: 'wrap-selection-with-kbd',
      name: 'Wrap selection with <kbd>',
      editorCallback: (editor: Editor) => {
        this.wrapSelectionWithKbd(editor);
      },
    });

    // Add context menu item with separator for Format grouping
    this.registerEvent(
      this.app.workspace.on('editor-menu', (menu: Menu, editor: Editor) => {
        // Add separator to group with formatting commands
        menu.addSeparator();
        
        // Add our kbd formatting option
        menu.addItem((item) => {
          item
            .setTitle(translate('menu-item-title'))
            .setIcon('keyboard')
            .onClick(() => {
              this.wrapSelectionWithKbd(editor);
            });
        });
      })
    );

    // Add settings tab
    this.addSettingTab(new KbdSettingTab(this.app, this));
  }

  /**
   * Plugin cleanup method called when the plugin is unloaded.
   * Removes any applied CSS classes to prevent style conflicts.
   */
  onunload() {
    // Remove any applied styles
    document.body.classList.remove('kbd-style-default', 'kbd-style-github', 'kbd-style-stackoverflow');
  }

  /**
   * Loads plugin settings from Obsidian's data storage.
   * Merges saved settings with default settings to ensure all properties exist.
   */
  async loadSettings() {
    this.settings = { ...DEFAULT_SETTINGS, ...(await this.loadData()) };
  }

  /**
   * Saves current plugin settings to Obsidian's data storage.
   * Also applies any style changes immediately after saving.
   */
  async saveSettings() {
    await this.saveData(this.settings);
    this.applyKbdStyle();
  }

  /**
   * Applies the selected kbd styling to the document body.
   * Removes all existing kbd style classes and applies the currently selected one.
   */
  private applyKbdStyle() {
    // Remove all style classes first
    document.body.classList.remove('kbd-style-default', 'kbd-style-github', 'kbd-style-stackoverflow');
    
    // Apply the selected style
    document.body.classList.add(`kbd-style-${this.settings.kbdStyle}`);
  }
} 