/**
 * @fileoverview Default configuration settings for the Kbd plugin. Defines
 * initial values for user preferences and plugin behavior.
 */

import { KbdWrapperSettings } from './types';

/**
 * Default settings for the Kbd plugin.
 * Provides initial configuration values that are used when the plugin
 * is first installed or when settings are reset.
 */
export const DEFAULT_SETTINGS: KbdWrapperSettings = {
  kbdStyle: 'default'
};