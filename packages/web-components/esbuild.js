import esbuild from 'esbuild';
import fs from 'fs';
import path from 'path';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { version } = require('./package.json');

const entryPoints = [
  './index.js',
  './components/combobox/src/index.js',
  './components/document/src/index.js',
  './components/end-user-consent/src/index.js',
  './components/navigation/src/index.js',
  './components/selfie/src/index.js',
  './components/signature-pad/src/index.js',
  './components/totp-consent/src/index.js',
  './components/smart-camera-web/src/SmartCameraWeb.js',
];
const buildDir = 'build';

/**
 * Ensures a directory exists. If not, creates it.
 * @param {string} dirPath - The path to the directory.
 */
const ensureDirSync = (dirPath) => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
};

/**
 * Recursively copies files from source to destination with a filter option.
 * @param {string} srcDir - The source directory.
 * @param {string} destDir - The destination directory.
 * @param {Function} filterFn - A function to filter which files to copy.
 */
const copySync = (srcDir, destDir, filterFn) => {
  const entries = fs.readdirSync(srcDir, { withFileTypes: true });

  entries.forEach((entry) => {
    const srcPath = path.join(srcDir, entry.name);
    const destPath = path.join(destDir, entry.name);

    if (entry.isDirectory()) {
      ensureDirSync(destPath);
      copySync(srcPath, destPath, filterFn);
    } else if (!filterFn || filterFn(entry.name)) {
      fs.copyFileSync(srcPath, destPath);
    }
  });
};

/**
 * Copies specific files from source to destination based on a pattern.
 * @param {string} srcDir - The source directory.
 * @param {string} pattern - A wildcard pattern to filter files. e.g., '*.html'
 * @param {string} destDir - The destination directory.
 */
const copyFiles = (srcDir, pattern, destDir) => {
  const files = fs
    .readdirSync(srcDir)
    .filter((file) => file.match(new RegExp(pattern.replace('*', '.*'))));
  files.forEach((file) => {
    const srcPath = path.join(srcDir, file);
    const destPath = path.join(destDir, file);
    fs.copyFileSync(srcPath, destPath);
  });
};

/**
 * Performs preparatory tasks for production mode.
 * Clears the 'dist' directory, ensures it exists,
 * and copies necessary files.
 */
const prebuild = () => {
  if (fs.existsSync(buildDir)) {
    fs.rmSync(buildDir, { recursive: true });
  }
  ensureDirSync(buildDir);
  copyFiles('.', 'package.json', buildDir);
};

/**
 * Performs preparatory tasks for development mode.
 * Clears the 'build' directory, ensures it exists,
 * copies necessary files, and copies HTML pages from cypress.
 */
const prebuildPages = () => {
  ensureDirSync(buildDir);
  copyFiles('cypress/pages', '*.html', buildDir);
};

prebuild();

if (process.env.NODE_ENV === 'development') {
  prebuildPages();
}

const buildOptions = {
  bundle: true,
  define: {
    SMILE_COMPONENTS_VERSION: JSON.stringify(version),
  },
  entryPoints,
  minify: process.env.NODE_ENV !== 'development',
};

const buildESM = () => esbuild.build({
  ...buildOptions,
  format: 'esm',
  outdir: `${buildDir}/esm`,
});

const buildCJS = () => esbuild.build({
  ...buildOptions,
  format: 'cjs',
  outdir: `${buildDir}/cjs`,
});

Promise.all([buildESM(), buildCJS()])
  .then(() => console.info('Build completed!'))
  .catch((error) => {
    console.error('Build failed:', error);
    process.exit(1);
  });
