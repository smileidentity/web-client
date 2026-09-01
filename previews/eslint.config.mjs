/**
 * This is intended to be a basic starting point for linting in your app.
 * It relies on recommended configs out of the box for simplicity, but you can
 * and should modify this configuration to best suit your team's needs.
 */
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import js from '@eslint/js';
import { FlatCompat } from '@eslint/eslintrc';

const dirname = path.dirname(fileURLToPath(import.meta.url));
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
          'import/resolver': {
            typescript: {},
          },
          linkComponents: [
            { linkAttribute: 'to', name: 'Link' },
            { linkAttribute: 'to', name: 'NavLink' },
          ],
          react: {
            version: 'detect',
          },
        },
      },

      // Typescript
      {
        extends: [
          'plugin:@typescript-eslint/recommended',
          'plugin:import/recommended',
          'plugin:import/typescript',
        ],
        files: ['**/*.{ts,tsx}'],
        parser: '@typescript-eslint/parser',
        plugins: ['@typescript-eslint', 'import'],
        settings: {
          'import/internal-regex': '^~/',
          // Under flat config eslint-plugin-import follows `import * as x`
          // into node_modules and has no parser for the .js it lands on, so
          // import/namespace reports "parserPath or languageOptions.parser is
          // required". Stating the default ignore list explicitly stops it.
          'import/ignore': ['node_modules'],
          'import/resolver': {
            node: {
              extensions: ['.ts', '.tsx'],
            },
            typescript: {
              alwaysTryTypes: true,
            },
          },
        },
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
];
