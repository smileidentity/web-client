import esbuild from 'esbuild';
import fs from 'fs';
import path from 'path';
import { createRequire } from 'node:module';
import { gzipSync } from 'zlib'; // added for gzip compression

const require = createRequire(import.meta.url);
const { version } = require('./package.json');

// the first entry point is the main point but the rest are added for when
// a particular component is imported. The first entry point is renamed to smart-camera-web.js
// and gzipped for the final build.
const entryPoints = [
  './src/index.js',
  './src/components/combobox/src/index.js',
  './src/components/document/src/index.js',
  './src/components/end-user-consent/src/index.js',
  './src/components/selfie/src/index.js',
  './src/components/signature-pad/src/index.js',
  './src/components/totp-consent/src/index.js',
  './src/components/smart-camera-web/src/SmartCameraWeb.js',
];
const buildDir = 'dist';
const compatDir = 'esm'; // For compatibility with modern browsers
const isProduction = process.env.NODE_ENV !== 'development';

const debugLog = (message, ...options) => {
  if (process.env.DEBUG) {
    // eslint-disable-next-line no-console
    console.debug(message, ...options);
  }
};

/**
 * Cleans a directory by removing it if it exists.
 * @param {string} dirPath - The path to the directory.
 */
const cleanDir = (dirPath) => {
  if (fs.existsSync(dirPath)) {
    debugLog(`Cleaning directory: ${dirPath}`);
    fs.rmSync(dirPath, { recursive: true });
  }
};

/**
 * Ensures a directory exists. If not, creates it.
 * @param {string} dirPath - The path to the directory.
 */
const ensureDirSync = (dirPath) => {
  debugLog(`Ensuring directory exists: ${dirPath}`);
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
  debugLog(`Copying files from ${srcDir} to ${destDir}`);
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
  console.info('Building web components...', version, process.env.NODE_ENV);

  cleanDir(buildDir);
  ensureDirSync(buildDir);
  ensureDirSync(`${buildDir}/${compatDir}`);
  copyFiles('.', '*.json', buildDir);
  copyFiles('.', '*.md', buildDir);
  copyFiles('.', '*.md', `${buildDir}/${compatDir}`);
  copySync('./src', `${buildDir}/${compatDir}`, (file) => file.endsWith('.md'));
  copySync('./src', `${buildDir}`, (file) => file.endsWith('.md'));
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
  minify: isProduction,
  outbase: '.',
  platform: 'browser',
  sourcemap: isProduction,
};

// TODO:  Barnabas: add code splitting for the components
const buildESM = () =>
  esbuild.build({
    ...buildOptions,
    format: 'esm',
    outbase: './src',
    outdir: `${buildDir}/${compatDir}`,
  });

const buildIife = () =>
  esbuild.build({
    ...buildOptions,
    format: 'iife',
    outdir: `${buildDir}`,
        target: ['chrome55', 'firefox57', 'safari11', 'edge79'], // Support Android 7.1.1+ Chrome WebView 55+
  });

/**
 * After build completion, renames the bundle generated from
 * src/index.js to smart-camera-web.js and compresses it with gzip.
 */
const renameAndGzip = () => {
  // Process IIFE build output
  const iifeOldPath = path.join(buildDir, entryPoints[0]);
  const iifeNewPath = path.join(buildDir, 'smart-camera-web.js');

  if (fs.existsSync(iifeOldPath)) {
    fs.renameSync(iifeOldPath, iifeNewPath);
    const fileContent = fs.readFileSync(iifeNewPath);
    const zippedContent = gzipSync(fileContent);
    fs.writeFileSync(`${iifeNewPath}.gz`, zippedContent);
    console.info('Renamed and gzipped iife file:', iifeNewPath);
  }

  // Process ESM build output
  const esmOldPath = path.join(buildDir, compatDir, 'index.js');
  const esmNewPath = path.join(buildDir, compatDir, 'smart-camera-web.js');

  if (fs.existsSync(esmOldPath)) {
    fs.renameSync(esmOldPath, esmNewPath);
    const fileContent = fs.readFileSync(esmNewPath);
    const zippedContent = gzipSync(fileContent);
    fs.writeFileSync(`${esmNewPath}.gz`, zippedContent);
    console.info('Renamed and gzipped esm file:', esmNewPath);
  }
};

Promise.all([buildESM(), buildIife()])
  .then(() => {
    renameAndGzip();
    console.info('Build completed!');
  })
  .catch((error) => {
    console.error('Build failed:', error);
    process.exit(1);
  });
