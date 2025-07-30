import { defineConfig, loadEnv } from 'vite';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

import preact from '@preact/preset-vite';
import dts from 'vite-plugin-dts';
import { visualizer } from 'rollup-plugin-visualizer';

// eslint-disable-next-line no-underscore-dangle
const __filename = fileURLToPath(import.meta.url);
// eslint-disable-next-line no-underscore-dangle
const __dirname = dirname(__filename);

// Read package.json for version
const packageJson = JSON.parse(fs.readFileSync('./package.json', 'utf8'));
const { version } = packageJson;

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const isProduction = mode === 'production';
  const generateStats = process.env.GENERATE_STATS === 'true';
  const buildFormat = process.env.BUILD_FORMAT || 'esm';
  const port = parseInt(env.PORT || '3005', 10);

  const plugins = [
    preact({
      jsxImportSource: 'preact',
    }),
    dts({
      include: ['lib/**/*'],
      exclude: ['lib/**/*.stories.*', 'lib/**/*.test.*'],
      outDir: 'dist/types',
      insertTypesEntry: true,
      rollupTypes: true,
      copyDtsFiles: true,
      tsconfigPath: './tsconfig.app.json',
    }),
  ];

  // Only add visualizer when explicitly requested
  if (generateStats) {
    plugins.push(
      visualizer({
        filename: 'dist/bundle-analysis.html',
        open: false,
        gzipSize: true,
        brotliSize: true,
      }),
    );
  }

  const esmBuildConfig = {
    lib: {
      entry: {
        main: resolve(__dirname, 'lib/main.ts'),
        combobox: resolve(__dirname, 'lib/components/combobox/src/index.js'),
        document: resolve(__dirname, 'lib/components/document/src/index.js'),
        'end-user-consent': resolve(
          __dirname,
          'lib/components/end-user-consent/src/index.js',
        ),
        navigation: resolve(
          __dirname,
          'lib/components/navigation/src/index.js',
        ),
        selfie: resolve(__dirname, 'lib/components/selfie/src/index.js'),
        'signature-pad': resolve(
          __dirname,
          'lib/components/signature-pad/src/index.js',
        ),
        'totp-consent': resolve(
          __dirname,
          'lib/components/totp-consent/src/index.js',
        ),
        'smart-camera-web': resolve(
          __dirname,
          'lib/components/smart-camera-web/src/SmartCameraWeb.js',
        ),
      },
      formats: ['es'],
    },
    rollupOptions: {
      external: ['signature_pad', 'validate.js'],
      output: {
        dir: 'dist/esm',
        entryFileNames: '[name].js',
      },
    },
    sourcemap: isProduction,
    minify: isProduction,
    emptyOutDir: buildFormat === 'esm',
  };

  const iifeBuildConfig = {
    target: 'es2015',
    lib: {
      entry: resolve(__dirname, 'lib/main.ts'),
      name: 'SmartCameraWeb',
      formats: ['iife'],
      fileName: () => 'smart-camera-web.js',
    },
    rollupOptions: {
      output: {
        dir: 'dist',
      },
    },
    sourcemap: isProduction,
    minify: isProduction,
    outDir: 'dist',
    emptyOutDir: false,
  };

  return {
    plugins,

    esbuild: {
      jsx: 'automatic',
      jsxImportSource: 'preact',
    },

    define: {
      SMILE_COMPONENTS_VERSION: JSON.stringify(version),
      COMPONENTS_VERSION: JSON.stringify(version),
    },

    build: buildFormat === 'iife' ? iifeBuildConfig : esmBuildConfig,

    server: {
      port,
    },

    resolve: {
      alias: {
        '@': resolve(__dirname, 'lib'),
        '@src': resolve(__dirname, 'src'),
        '@root': resolve(__dirname),
        react: 'preact/compat',
        'react-dom': 'preact/compat',
      },
    },
  };
});
