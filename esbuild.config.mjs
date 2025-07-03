import esbuild from 'esbuild';

const mode = process.argv[2] ?? 'production';
const isDev = mode === 'dev' || mode === 'development';


const banner = {
  js: `/*! Kbd Plugin for Obsidian | MIT License | Keith Walsh */`,
};

/**
 * Build the plugin with esbuild.
 *  - entry: src/main.ts
 *  - output: main.js (CJS)
 *  - external obsidian API (provided by app)
 *  - watch / sourcemap in dev mode
 */
const common = {
  entryPoints: ['src/main.ts'],
  bundle: true,
  outfile: 'main.js',
  platform: 'node',
  format: 'cjs',
  target: ['es2020'],
  external: ['obsidian'],
  sourcemap: isDev,
  treeShaking: true,
  minify: !isDev,
  banner: !isDev ? banner : undefined,
  define: {
    'process.env.NODE_ENV': JSON.stringify(isDev ? 'development' : 'production'),
  },
};

if (isDev) {
  const ctx = await esbuild.context(common);
  await ctx.watch();
  console.log('✨ esbuild is watching for changes...');
} else {
  await esbuild.build(common);
  console.log('✨ Production build completed');
}