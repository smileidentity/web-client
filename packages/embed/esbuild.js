import fs from 'fs';
import path from 'path';
import esbuild from 'esbuild';
import * as sentry from '@sentry/esbuild-plugin';

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

  // eslint-disable-next-line no-restricted-syntax
  for (const entry of entries) {
    const srcPath = path.join(srcDir, entry.name);
    const destPath = path.join(destDir, entry.name);

    if (entry.isDirectory()) {
      ensureDirSync(destPath);
      copySync(srcPath, destPath, filterFn);
    } else if (!filterFn || filterFn(entry.name)) {
      fs.copyFileSync(srcPath, destPath);
    }
  }
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
  ensureDirSync('build');
  copySync('src', 'build', (file) => !file.endsWith('.js'));
  copyFiles('cypress/pages', '*.html', 'build');
};

const files = fs
  .readdirSync('src/js/', { recursive: true })
  .filter((file) => file.endsWith('.js'));

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

files.forEach((file) => {
  const baseName = path.basename(file, '.js');
  const dir = path.dirname(file);

  if (process.env.NODE_ENV === 'development') {
    esbuild.build({
      ...devOptions,
      entryPoints: [`src/js/${file}`],
      outfile: `build/js/${dir}/${baseName}.min.js`,
    });
  } else {
    esbuild.build({
      ...prodOptions,
      entryPoints: [`src/js/${file}`],
      outfile: `dist/js/${dir}/${baseName}.min.js`,
      sourcemap: true, // Source map generation must be turned on
      plugins: [
        // Put the Sentry esbuild plugin after all other plugins
        sentry.sentryEsbuildPlugin({
          applicationKey: 'smileid-web-client',
          authToken: process.env.SENTRY_AUTH_TOKEN,
          org: 'smile-identity',
          project: 'web-client',
          errorHandler: (err) => {
            // eslint-disable-next-line no-console
            console.warn('Sentry plugin error:', err);
            return true;
          },
        }),
      ],
    });
  }
});
