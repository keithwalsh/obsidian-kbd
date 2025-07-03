import { Plugin, Editor, Notice } from 'obsidian';

export default class KbdWrapperPlugin extends Plugin {
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
        const selection = editor.getSelection();
        if (selection && selection.length > 0) {
          editor.replaceSelection(`<kbd>${selection}</kbd>`);
        } else {
          new Notice('Please select text to wrap in <kbd> tags.');
        }
      },
    });
  }
} 