import path from 'node:path';
import { fileURLToPath } from 'node:url';
import js from '@eslint/js';
import { FlatCompat } from '@eslint/eslintrc';
import pluginCypress from 'eslint-plugin-cypress';

const dirname = path.dirname(fileURLToPath(import.meta.url));
const compat = new FlatCompat({
  baseDirectory: dirname,
  recommendedConfig: js.configs.recommended,
});

export default [
  // eslint-plugin-cypress 7 dropped the eslintrc `cypress/globals` env; this flat
  // config supplies the same globals (1221, a superset of the old 788).
  pluginCypress.configs.globals,
  {
    // eslint 9 turned `reportUnusedDisableDirectives` on by default. Held at
    // the eslint 8 setting so the upgrade reports the same problems; turn it
    // back on once the stale eslint-disable comments are cleared out.
    linterOptions: { reportUnusedDisableDirectives: 'off' },
  },
  { ignores: ['cypress/pages/instrumented/**', '**/node_modules/**'] },
  ...compat.config({
    env: {
      browser: true,
      commonjs: true,
      es2021: true,
    },
    extends: 'airbnb-base',
    parserOptions: {
      ecmaVersion: 'latest',
    },
    rules: {
      curly: 'off',
      'function-paren-newline': 'off',
      'implicit-arrow-linebreak': 'off',
      indent: 'off',
      'max-classes-per-file': 'off',
      'max-len': 'off',
      'no-console': ['error', { allow: ['warn', 'error', 'info'] }],
      'no-plusplus': 'off',
      'no-underscore-dangle': 'off',
      'nonblock-statement-body-position': 'off',
      'operator-linebreak': 'off',
      // `caughtErrors: 'none'` restores the eslint 8 default, which eslint 9
      // changed to 'all'. Drop it to start flagging unused catch params.
      'no-unused-vars': [
        'error',
        {
          args: 'after-used',
          caughtErrors: 'none',
          ignoreRestSiblings: false,
          vars: 'all',
        },
      ],
      'sort-keys': 'error',
    },
  }),
];
