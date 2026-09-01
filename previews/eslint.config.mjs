/**
 * This is intended to be a basic starting point for linting in your app.
 * It relies on recommended configs out of the box for simplicity, but you can
 * and should modify this configuration to best suit your team's needs.
 */
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import js from '@eslint/js';
import { FlatCompat } from '@eslint/eslintrc';
import importX from 'eslint-plugin-import-x';

const dirname = path.dirname(fileURLToPath(import.meta.url));
// eslint-plugin-react's `version: 'detect'` path calls context.getFilename(),
// which eslint 10 removed, so the plugin throws on load. Reading the installed
// version here is what detection would have resolved to, without the crash.
const reactVersion = createRequire(import.meta.url)(
  'react/package.json',
).version;

const compat = new FlatCompat({
  baseDirectory: dirname,
  recommendedConfig: js.configs.recommended,
});

export default [
  {
    // eslint 9 turned `reportUnusedDisableDirectives` on by default. Held at
    // the eslint 8 setting so the upgrade reports the same problems; turn it
    // back on once the stale eslint-disable comments are cleared out.
    linterOptions: { reportUnusedDisableDirectives: 'off' },
  },
  {
    // Flat config has no `--ignore-path`, so previews/.gitignore is inlined
    // here. Keep the two in step.
    ignores: [
      '**/node_modules/**',
      '.cache/**',
      'build/**',
      '.react-router/**',
      '.sst/**',
      'sst-env.d.ts',
    ],
  },
  ...compat.config({
    env: {
      browser: true,
      commonjs: true,
      es6: true,
    },
    extends: ['eslint:recommended'],
    overrides: [
      // React
      {
        extends: [
          'plugin:react/recommended',
          'plugin:react/jsx-runtime',
          'plugin:react-hooks/recommended',
          'plugin:jsx-a11y/recommended',
        ],
        files: ['**/*.{js,jsx,ts,tsx}'],
        plugins: ['react', 'jsx-a11y'],
        settings: {
          formComponents: ['Form'],
          'import-x/resolver': {
            typescript: {},
          },
          linkComponents: [
            { linkAttribute: 'to', name: 'Link' },
            { linkAttribute: 'to', name: 'NavLink' },
          ],
          react: {
            version: reactVersion,
          },
        },
      },

      // Typescript
      {
        extends: ['plugin:@typescript-eslint/recommended'],
        files: ['**/*.{ts,tsx}'],
        parser: '@typescript-eslint/parser',
        plugins: ['@typescript-eslint'],
      },

      // Node
      {
        env: {
          node: true,
        },
        files: ['eslint.config.mjs'],
      },
    ],
    parserOptions: {
      ecmaFeatures: {
        jsx: true,
      },
      ecmaVersion: 'latest',
      sourceType: 'module',
    },
    root: true,
  }),
  {
    // Replaces `plugin:import/recommended` + `plugin:import/typescript`.
    // eslint-plugin-import caps its eslint peer at ^9, so import-x takes over;
    // its rules and settings live under the `import-x/` prefix.
    ...importX.flatConfigs.recommended,
    files: ['**/*.{ts,tsx}'],
  },
  {
    ...importX.flatConfigs.typescript,
    files: ['**/*.{ts,tsx}'],
    settings: {
      ...importX.flatConfigs.typescript.settings,
      'import-x/internal-regex': '^~/',
      // Under flat config import-x follows `import * as x` into node_modules
      // and has no parser for the .js it lands on, so import-x/namespace
      // reports "parserPath or languageOptions.parser is required". Stating
      // the default ignore list explicitly stops it.
      'import-x/ignore': ['node_modules'],
      'import-x/resolver': {
        node: { extensions: ['.ts', '.tsx'] },
        typescript: { alwaysTryTypes: true },
      },
    },
  },
];
