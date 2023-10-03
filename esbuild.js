const fs = require("fs");
const path = require("path");
const esbuild = require("esbuild");
const rimraf = require("rimraf");

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
    .filter((file) => file.match(new RegExp(pattern.replace("*", ".*"))));
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
  rimraf.sync("dist");
  ensureDirSync("dist");
  copySync("src", "dist", (file) => !file.endsWith(".js"));
};

/**
 * Performs preparatory tasks for development mode.
 * Clears the 'build' directory, ensures it exists,
 * copies necessary files, and copies HTML pages from cypress.
 */
const prebuild = () => {
  rimraf.sync("build");
  ensureDirSync("build");
  copySync("src", "build", (file) => !file.endsWith(".js"));
  copyFiles("cypress/pages", "*.html", "build");
};

const files = fs.readdirSync("src/js").filter((file) => file.endsWith(".js"));

if (process.env.NODE_ENV === "development") {
  prebuild();
} else {
  prebuildDist();
}

const devOptions = {
  bundle: true,
};

const prodOptions = {
  bundle: true,
  minify: true,
};

files.forEach((file) => {
  const baseName = path.basename(file, ".js");
  if (process.env.NODE_ENV === "development") {
    esbuild.build({
      ...devOptions,
      entryPoints: [`src/js/${file}`],
      outfile: `build/js/${baseName}.min.js`,
    });
  } else {
    esbuild.build({
      ...prodOptions,
      entryPoints: [`src/js/${file}`],
      outfile: `dist/js/${baseName}.min.js`,
    });
  }
});
