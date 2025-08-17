/**
 * @fileoverview Type definitions for the Kbd Wrapper plugin, including
 * interfaces for translations and settings.
 */

/**
 * Structure for storing plugin translations organized by language and key.
 * Supports nested translation keys for organizing related strings.
 */
export interface Translations {
  [key: string]: {
    [key: string]: string;
  };
}

/**
 * Configuration settings for the Kbd Wrapper plugin.
 * Controls the visual styling of keyboard shortcut elements.
 */
export interface KbdWrapperSettings {
  /** The keyboard shortcut styling theme to apply */
  kbdStyle: 'default' | 'github' | 'stackoverflow';
} 