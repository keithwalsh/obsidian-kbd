import { Plugin, Editor, Notice } from 'obsidian';

interface Translations {
  [key: string]: {
    [key: string]: string;
  };
}

export default class KbdWrapperPlugin extends Plugin {
  private translations: Translations = {
    en: {
      'select-text-notice': 'Please select text to wrap in <kbd> tags.',
    },
    es: {
      'select-text-notice': 'Por favor selecciona texto para envolver en etiquetas <kbd>.',
    },
    fr: {
      'select-text-notice': 'Veuillez sélectionner du texte à envelopper dans les balises <kbd>.',
    },
    de: {
      'select-text-notice': 'Bitte wählen Sie Text aus, um ihn in <kbd>-Tags zu verpacken.',
    },
    it: {
      'select-text-notice': 'Seleziona il testo da avvolgere nei tag <kbd>.',
    },
    pt: {
      'select-text-notice': 'Selecione o texto para envolver em tags <kbd>.',
    },
    ru: {
      'select-text-notice': 'Пожалуйста, выберите текст для обертывания в теги <kbd>.',
    },
    zh: {
      'select-text-notice': '请选择要用 <kbd> 标签包装的文本。',
    },
    ja: {
      'select-text-notice': '<kbd>タグで囲むテキストを選択してください。',
    },
    ko: {
      'select-text-notice': '<kbd> 태그로 감쌀 텍스트를 선택하세요.',
    },
  };

  private getCurrentLocale(): string {
    // Try to get locale from Obsidian settings or browser
    const locale = (window as any).moment?.locale?.() || 
                   navigator.language?.substring(0, 2) || 
                   'en';
    
    // Return supported locale or fallback to English
    return this.translations[locale] ? locale : 'en';
  }

  private t(key: string): string {
    const locale = this.getCurrentLocale();
    return this.translations[locale]?.[key] || this.translations['en'][key] || key;
  }

  async onload() {
    this.addCommand({
      id: 'wrap-selection-with-kbd',
      name: 'Wrap selection with <kbd>',
      hotkeys: [
        {
          modifiers: ["Mod"],
          key: "k",
        },
      ],
      editorCallback: (editor: Editor) => {
        const selections = editor.listSelections();
        const hasNonEmptySelection = selections.some(sel => {
          const text = editor.getRange(sel.anchor, sel.head);
          return text && text.length > 0;
        });

        if (hasNonEmptySelection) {
          // Process selections in reverse order to avoid position shifts
          selections.reverse().forEach(sel => {
            const text = editor.getRange(sel.anchor, sel.head);
            if (text && text.length > 0) {
              editor.replaceRange(`<kbd>${text}</kbd>`, sel.anchor, sel.head);
            }
          });
        } else {
          new Notice(this.t('select-text-notice'));
        }
      },
    });
  }
} 