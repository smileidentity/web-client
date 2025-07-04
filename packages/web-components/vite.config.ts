import { defineConfig, type Plugin, loadEnv } from 'vite';
import { resolve, dirname } from 'path';
import { globSync } from 'glob';
import { fileURLToPath } from 'url';

import preact from '@preact/preset-vite';
import dts from 'vite-plugin-dts';
import { gzipSync } from 'zlib';
import fs from 'fs';

// eslint-disable-next-line no-underscore-dangle
const __filename = fileURLToPath(import.meta.url);
// eslint-disable-next-line no-underscore-dangle
const __dirname = dirname(__filename);

// Read package.json for version
const packageJson = JSON.parse(fs.readFileSync('./package.json', 'utf8'));
const { version } = packageJson;

// Entry points updated for new lib/ structure
const entryPoints = [
  './lib/main.ts',
  './lib/components/combobox/src/index.js',
  './lib/components/document/src/index.js',
  './lib/components/end-user-consent/src/index.js',
  './lib/components/navigation/src/index.js',
  './lib/components/selfie/src/index.js',
  './lib/components/signature-pad/src/index.js',
  './lib/components/totp-consent/src/index.js',
  './lib/components/smart-camera-web/src/SmartCameraWeb.js',
];

// Convert entry points to Vite input format
const input: Record<string, string> = {};
entryPoints.forEach((entry) => {
  const relativePath = entry.replace('./lib/', '');
  const name = relativePath
    .replace(/\/src\/index\.(js|ts)$/, '')
    .replace(/\.js$/, '')
    .replace(/main\.ts$/, 'main')
    .replace(/\//g, '-');
  const key = name === 'main' ? 'main' : name;
  input[key] = resolve(__dirname, entry);
});

// Plugin to copy essential files and handle post-build tasks
const buildPlugin = (): Plugin => ({
  name: 'build-tasks',
  writeBundle() {
    const buildDir = 'dist';

    // Ensure directories exist
    if (!fs.existsSync(buildDir)) {
      fs.mkdirSync(buildDir, { recursive: true });
    }

    // Copy essential files
    const filesToCopy = ['package.json', 'README.md'];
    filesToCopy.forEach((file) => {
      if (fs.existsSync(file)) {
        fs.copyFileSync(file, resolve(buildDir, file));
      }
    });

    // Copy README files from lib directory
    if (fs.existsSync('./lib')) {
      try {
        const readmeFiles = globSync('**/*.md', { cwd: './lib' });
        readmeFiles.forEach((file) => {
          const srcPath = resolve('./lib', file);
          const destPath = resolve(buildDir, file);
          const destDirPath = dirname(destPath);
          if (!fs.existsSync(destDirPath)) {
            fs.mkdirSync(destDirPath, { recursive: true });
          }
          fs.copyFileSync(srcPath, destPath);
        });
      } catch (e) {
        console.warn('Could not copy README files:', (e as Error).message);
      }
    }

    // Rename main.js to smart-camera-web.js and gzip it
    const mainPath = resolve(buildDir, 'main.js');
    const smartCameraPath = resolve(buildDir, 'smart-camera-web.js');

    if (fs.existsSync(mainPath)) {
      fs.renameSync(mainPath, smartCameraPath);
      const fileContent = fs.readFileSync(smartCameraPath);
      const zippedContent = gzipSync(fileContent);
      fs.writeFileSync(`${smartCameraPath}.gz`, zippedContent);
      console.info('✓ Created and gzipped smart-camera-web.js');
    }
  },
});

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const isProduction = mode === 'production';
  const port = parseInt(env.PORT || '3005', 10);

  return {
    plugins: [
      preact(),
      dts({
        include: ['lib/**/*'],
        exclude: ['lib/**/*.stories.*', 'lib/**/*.test.*'],
        outDir: 'dist/types',
      }),
      buildPlugin(),
    ],

    define: {
      SMILE_COMPONENTS_VERSION: JSON.stringify(version),
      COMPONENTS_VERSION: JSON.stringify(version),
    },

    build: {
      lib: {
        entry: input,
        formats: ['es'],
        fileName: (format, entryName) => `${entryName}.js`,
      },
      rollupOptions: {
        external: ['signature_pad', 'validate.js'],
        output: {
          globals: {
            signature_pad: 'SignaturePad',
            'validate.js': 'validate',
          },
        },
      },
      sourcemap: isProduction,
      minify: isProduction,
      outDir: 'dist',
      emptyOutDir: true,
    },
    server: {
      port,
      open: true,
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

    // esbuild: {
    //   jsxFactory: 'h',
    //   // jsxFragment: 'Fragment',
    //   // jsxInject: "import { h, Fragment } from 'preact'",
    // },
  };
});
