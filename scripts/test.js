#!/usr/bin/env node

/**
 * @fileoverview Test runner script with enhanced output formatting and
 * development-friendly features for the Kbd Wrapper plugin test suite.
 */

const { spawn } = require('child_process');
const path = require('path');

const args = process.argv.slice(2);
const isWatchMode = args.includes('--watch') || args.includes('-w');
const isCoverageMode = args.includes('--coverage') || args.includes('-c');
const isVerbose = args.includes('--verbose') || args.includes('-v');

// Build Jest command
let jestArgs = [];

if (isWatchMode) {
  jestArgs.push('--watch');
}

if (isCoverageMode) {
  jestArgs.push('--coverage');
}

if (isVerbose) {
  jestArgs.push('--verbose');
}

// Add any remaining arguments (test patterns, etc.)
const otherArgs = args.filter(arg => 
  !['--watch', '-w', '--coverage', '-c', '--verbose', '-v'].includes(arg)
);
jestArgs.push(...otherArgs);

console.log('🧪 Running Kbd Wrapper Plugin Tests...\n');

if (isWatchMode) {
  console.log('👀 Watch mode enabled - tests will re-run on file changes');
}

if (isCoverageMode) {
  console.log('📊 Coverage reporting enabled');
}

console.log('');

// Run Jest
const jest = spawn('npx', ['jest', ...jestArgs], {
  stdio: 'inherit',
  cwd: path.resolve(__dirname, '..'),
  shell: process.platform === 'win32'
});

jest.on('error', (error) => {
  console.error('❌ Failed to start Jest:', error);
  process.exit(1);
});

jest.on('close', (code) => {
  if (code === 0) {
    console.log('\n✅ All tests passed!');
  } else {
    console.log(`\n❌ Tests failed with exit code ${code}`);
  }
  process.exit(code);
});
