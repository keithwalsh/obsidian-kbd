# Test Suite for Kbd Wrapper Plugin

This directory contains comprehensive tests for the Obsidian Kbd Wrapper plugin, ensuring functionality, reliability, and maintainability.

## Test Structure

### Test Files

- **`setup.ts`** - Jest configuration and global mocks for Obsidian API
- **`translations.test.ts`** - Tests for internationalization and locale handling
- **`constants.test.ts`** - Tests for constants, types, and configuration validation
- **`settings.test.ts`** - Tests for settings tab UI and user interactions
- **`main.test.ts`** - Tests for core plugin functionality including kbd wrapping logic

### Coverage Areas

#### Core Functionality
- ✅ Text selection wrapping with `<kbd>` tags
- ✅ Unwrapping existing `<kbd>` tags
- ✅ Cursor-based unwrapping when inside `<kbd>` tags
- ✅ Multiple selection handling
- ✅ Edge cases (empty selections, malformed tags, nested tags)

#### Settings & Configuration
- ✅ Settings tab UI rendering
- ✅ Style option dropdown functionality
- ✅ Settings persistence and loading
- ✅ Default configuration validation

#### Internationalization
- ✅ Multi-language support (10 languages)
- ✅ Locale detection and fallback mechanisms
- ✅ Translation key consistency across languages

#### Plugin Lifecycle
- ✅ Plugin initialization and cleanup
- ✅ Command registration
- ✅ Context menu integration
- ✅ CSS style management

## Running Tests

### Prerequisites

Install test dependencies:
```bash
npm install
```

### Test Commands

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage report
npm run test:coverage
```

### Test Environment

Tests run in a Jest environment with:
- **jsdom** for DOM simulation
- **ts-jest** for TypeScript support
- **Mocked Obsidian API** to avoid dependencies on the actual Obsidian environment

## Test Patterns

### Mocking Strategy

The test suite uses comprehensive mocking for:
- **Obsidian API classes** (Plugin, Editor, Notice, etc.)
- **DOM methods** (document.body.classList)
- **Translation functions** with predictable return values

### Test Organization

Each test file follows a consistent structure:
1. **Setup** - Mock configuration and test data
2. **Unit Tests** - Individual function/method testing
3. **Integration Tests** - Component interaction testing
4. **Edge Cases** - Error handling and boundary conditions

### Assertions

Tests verify:
- **Functional correctness** - Does it work as expected?
- **Error handling** - Does it fail gracefully?
- **State management** - Are settings and UI state consistent?
- **User interactions** - Do UI events trigger correct behavior?

## Coverage Goals

The test suite aims for:
- **>90% line coverage** for critical functionality
- **100% coverage** for utility functions (translations, constants)
- **Edge case coverage** for user-facing features

## Contributing to Tests

When adding new features:

1. **Add corresponding tests** in the appropriate test file
2. **Update mocks** if new Obsidian API usage is added
3. **Maintain test isolation** - each test should be independent
4. **Test both success and failure cases**
5. **Follow existing naming conventions** and structure

### Test Naming Convention

```typescript
describe('ComponentName', () => {
  describe('methodName', () => {
    it('should [expected behavior] when [condition]', () => {
      // Test implementation
    });
  });
});
```

## Debugging Tests

### Common Issues

1. **Mock not working** - Check if the mock is properly configured in `setup.ts`
2. **TypeScript errors** - Ensure all mocked objects have proper type definitions
3. **Async test failures** - Use `await` for all async operations in tests

### Debug Commands

```bash
# Run specific test file
npm test -- translations.test.ts

# Run tests with verbose output
npm test -- --verbose

# Run tests matching a pattern
npm test -- --testNamePattern="translation"
```

## Continuous Integration

Tests are designed to run in CI environments without external dependencies. All Obsidian-specific functionality is mocked to ensure consistent, fast execution across different environments.
