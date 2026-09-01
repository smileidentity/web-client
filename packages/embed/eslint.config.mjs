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
  { ignores: ['build/**', 'dist/**', 'libs/**', '**/node_modules/**'] },
  ...compat.config({
    env: {
      'cypress/globals': true,
      browser: true,
      commonjs: true,
      es2021: true,
    },
    extends: ['airbnb-base', 'plugin:prettier/recommended'],
    globals: {
      validate: 'readonly',
      JSZip: 'readonly',
    },
    overrides: [
      {
        env: {
          node: true,
        },
        files: ['eslint.config.mjs'],
        parserOptions: {
          sourceType: 'module',
        },
      },
      {
        files: ['src/js/components/**'],
        rules: {
          'max-classes-per-file': 0,
        },
      },
    ],
    parserOptions: {
      ecmaVersion: 'latest',
    },
    plugins: ['cypress', 'prettier'],
    rules: {
      'class-methods-use-this': 0,
      'func-names': 0,
      'import/no-extraneous-dependencies': [
        'error',
        {
          devDependencies: [
            'eslint.config.mjs',
            'esbuild.js',
            'cypress.config.js',
            '**/*{.,_,-}{test,spec}.js', // tests where the extension or filename suffix denotes that it is a test
          ],
          optionalDependencies: false,
        },
      ],
      'max-len': 0,
      // eslint 9 flipped the `caughtErrors` default from 'none' to 'all'.
      // Pinned back to 'none' so the migration reports the same problems as
      // eslint 8 did; drop the option to start flagging unused catch params.
      'no-console': ['error', { allow: ['error'] }],
      'no-param-reassign': 0,
      'no-restricted-globals': 0,
      'no-unused-vars': [
        'error',
        {
          args: 'after-used',
          caughtErrors: 'none',
          ignoreRestSiblings: true,
          vars: 'all',
        },
      ],
      'no-use-before-define': 0,
      'no-useless-escape': 0,
      'one-var': ['error', 'never'],
      'prefer-destructuring': 0,
      'prettier/prettier': 'error',
      camelcase: 0,
      indent: 0,
      strict: 0,
    },
    settings: {
      'import/resolver': {
        '../eslint-plugin-import-resolver.js': { someConfig: 1 },
      },
    },
  }),
];
