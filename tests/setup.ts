/**
 * @fileoverview Test setup file for Jest configuration. Provides basic
 * DOM mocking for testing Obsidian plugin functionality.
 */

// Basic DOM setup - will be enhanced in individual tests as needed
if (typeof document !== 'undefined' && document.body) {
  document.body.classList = {
    add: () => {},
    remove: () => {},
    contains: () => false,
    toggle: () => false
  } as any;
}
