/**
 * @fileoverview Settings tab component for the Kbd Wrapper plugin, providing
 * configuration options for keyboard shortcut styling themes including default,
 * GitHub, and Stack Overflow styles.
 */

import { App, PluginSettingTab, Setting } from 'obsidian';
import { translate } from './translations';
import type KbdWrapperPlugin from './main';

/**
 * Settings tab for the Kbd Wrapper plugin that allows users to configure
 * the visual style of keyboard shortcuts in their notes.
 */
export class KbdSettingTab extends PluginSettingTab {
  /** Reference to the main plugin instance */
  plugin: KbdWrapperPlugin;

  /**
   * Creates a new settings tab instance.
   * @param app - The Obsidian app instance
   * @param plugin - The Kbd Wrapper plugin instance
   */
  constructor(app: App, plugin: KbdWrapperPlugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  /**
   * Renders the settings interface with available configuration options.
   * Creates a dropdown selector for choosing between different kbd styling themes.
   */
  display(): void {
    const { containerEl } = this;

    containerEl.empty();

    containerEl.createEl('h2', { text: translate('settings-title') });

    new Setting(containerEl)
      .setName(translate('style-setting'))
      .setDesc(translate('style-setting-desc'))
      .addDropdown(dropdown =>
        dropdown
          .addOption('default', translate('style-default'))
          .addOption('github', translate('style-github'))
          .addOption('stackoverflow', translate('style-stackoverflow'))
          .setValue(this.plugin.settings.kbdStyle)
          .onChange(async (value: string) => {
            this.plugin.settings.kbdStyle = value as 'default' | 'github' | 'stackoverflow';
            await this.plugin.saveSettings();
          })
      );
  }
} 