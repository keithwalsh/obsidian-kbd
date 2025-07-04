import { Plugin, Editor, Notice, Menu, PluginSettingTab, App, Setting } from 'obsidian';

// Extend the global Window interface to include moment
declare global {
  interface Window {
    moment?: {
      locale?: () => string;
    };
  }
}

interface Translations {
  [key: string]: {
    [key: string]: string;
  };
}

interface KbdWrapperSettings {
  kbdStyle: 'default' | 'github' | 'stackoverflow';
}

const DEFAULT_SETTINGS: KbdWrapperSettings = {
  kbdStyle: 'default'
};

export default class KbdWrapperPlugin extends Plugin {
  settings: KbdWrapperSettings = DEFAULT_SETTINGS;

  private readonly translations: Translations = {
    en: {
      'select-text-notice': 'Please select text to wrap in <kbd> tags.',
      'menu-item-title': '<kbd>',
      'settings-title': 'Kbd Style Settings',
      'style-setting': 'Kbd Style',
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

  private getCurrentLocale(): string {
    // Try to get locale from Obsidian settings or browser
    const locale = window.moment?.locale?.() || 
                   navigator.language?.substring(0, 2) || 
                   'en';
    
    // Return supported locale or fallback to English
    return this.translations[locale] ? locale : 'en';
  }

  public t(key: string): string {
    const locale = this.getCurrentLocale();
    return this.translations[locale]?.[key] || this.translations['en'][key] || key;
  }

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
      new Notice(this.t('select-text-notice'));
    }
  }

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
            .setTitle(this.t('menu-item-title'))
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

  onunload() {
    // Remove any applied styles
    document.body.classList.remove('kbd-style-default', 'kbd-style-github', 'kbd-style-stackoverflow');
  }

  async loadSettings() {
    this.settings = { ...DEFAULT_SETTINGS, ...(await this.loadData()) };
  }

  async saveSettings() {
    await this.saveData(this.settings);
    this.applyKbdStyle();
  }

  private applyKbdStyle() {
    // Remove all style classes first
    document.body.classList.remove('kbd-style-default', 'kbd-style-github', 'kbd-style-stackoverflow');
    
    // Apply the selected style
    document.body.classList.add(`kbd-style-${this.settings.kbdStyle}`);
  }
}

class KbdSettingTab extends PluginSettingTab {
  plugin: KbdWrapperPlugin;

  constructor(app: App, plugin: KbdWrapperPlugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display(): void {
    const { containerEl } = this;

    containerEl.empty();

    containerEl.createEl('h2', { text: this.plugin.t('settings-title') });

    new Setting(containerEl)
      .setName(this.plugin.t('style-setting'))
      .setDesc(this.plugin.t('style-setting-desc'))
      .addDropdown(dropdown =>
        dropdown
          .addOption('default', this.plugin.t('style-default'))
          .addOption('github', this.plugin.t('style-github'))
          .addOption('stackoverflow', this.plugin.t('style-stackoverflow'))
          .setValue(this.plugin.settings.kbdStyle)
          .onChange(async (value: string) => {
            this.plugin.settings.kbdStyle = value as 'default' | 'github' | 'stackoverflow';
            await this.plugin.saveSettings();
          })
      );
  }
} 