// eslint-disable-next-line import/no-extraneous-dependencies
import esbuild from 'esbuild';
import fs from 'fs';
import path from 'path';
import { createRequire } from 'node:module';

// Import the package.json file to get the version number by using the createRequire function
const require = createRequire(import.meta.url);
const { exports } = require('./package.json');

// Get the paths from the exports field
const exportPaths = Object.values(exports).map((filePath) => path.join(process.cwd(), filePath));

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
const prebuildDist = () => {
  if (fs.existsSync('dist')) {
    fs.rmSync('build', { recursive: true });
  }
  ensureDirSync('dist');
  copySync('src', 'dist', (file) => !file.endsWith('.js'));
};

/**
 * Performs preparatory tasks for development mode.
 * Clears the 'build' directory, ensures it exists,
 * copies necessary files, and copies HTML pages from cypress.
 */
const prebuild = () => {
  if (fs.existsSync('build')) {
    fs.rmSync('build', { recursive: true });
  }
  ensureDirSync('cypress/pages/instrumentation');
  copySync('dist', 'cypress/pages/instrumentation', (file) => !file.endsWith('.js'));
  // copyFiles('cypress/pages', '*.html', 'build');
};

// const files = fs
//   .readdirSync('components', { recursive: true })
//   .filter((file) => file.endsWith('.js'));

if (process.env.NODE_ENV === 'development') {
  prebuild();
} else {
  prebuildDist();
}

const devOptions = {
  bundle: true,
  minify: process.env.MINIFY === 'true',
};

const prodOptions = {
  bundle: true,
  minify: true,
};

// files.forEach((file) => {
if (process.env.NODE_ENV === 'development') {
  esbuild.build({
    ...devOptions,
    entryPoints: exportPaths,
    outdir: 'cypress/pages/instrumentation/js',
  });
} else {
  esbuild.build({
    ...prodOptions,
    entryPoints: exportPaths,
    outdir: 'dist/js',
  });
}
// });
