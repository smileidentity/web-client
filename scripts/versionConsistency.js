/**
 * Script to check if all package.json files in a monorepo have the same version.
 * This ensures consistency across all packages in the monorepo.
 */

const fs = require('fs');
const path = require('path');

const rootDir = process.cwd();
const packagesDir = path.join(rootDir, 'packages');

/**
 * Recursively gets all package.json file paths in a directory.
 *
 * @param {string} dir - The directory to search for package.json files.
 * @returns {string[]} - An array of package.json file paths.
 */
function getPackageJsonPaths(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach((file) => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat && stat.isDirectory()) {
      results = results.concat(getPackageJsonPaths(filePath));
    } else if (file === 'package.json') {
      results.push(filePath);
    }
  });
  return results;
}

/**
 * Checks if all package.json files have the same version.
 *
 * @param {string[]} paths - An array of package.json file paths.
 * @returns {boolean} - True if all versions are the same, false otherwise.
 */
function checkVersions(paths) {
  const versions = new Set();
  paths.forEach((filePath) => {
    const packageJson = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    versions.add(packageJson.version);
    if (process.env.LOG_LEVEL === 'debug') {
      console.debug(`${filePath} version: ${packageJson.version}`);
    }
  });
  return versions.size === 1;
}

/**
 * Main function to execute the script.
 * It gets all package.json file paths, checks their versions, and logs the result.
 */
function main() {
  const packageJsonPaths = getPackageJsonPaths(packagesDir);
  if (packageJsonPaths.length === 0) {
    console.log('No package.json files found.');
    return;
  }

  const allVersionsSame = checkVersions(packageJsonPaths);

  if (allVersionsSame) {
    console.log('All package.json files have the same version.');
    process.exit(0);
  } else {
    console.log('Versions mismatch found in package.json files.');
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}
