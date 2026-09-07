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

// `caughtErrors: 'none'` restores the eslint 8 default, which eslint 9 changed
// to 'all'. Drop it to start flagging unused catch params.
const unusedVars = [
  'error',
  {
    args: 'after-used',
    caughtErrors: 'none',
    ignoreRestSiblings: false,
    vars: 'all',
  },
];

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
  {
    ignores: [
      'build/**',
      'instrumentation/**',
      'dist/**',
      'libs/**',
      '**/node_modules/**',
      // The eslintrc setup ran `eslint --ext .js,.ts,.tsx`; flat config lints
      // .mjs/.cjs as well, so they are excluded to keep the same file set.
      '**/*.mjs',
      '**/*.cjs',
    ],
  },
  ...compat.config({
    env: {
      browser: true,
      commonjs: true,
      es2021: true,
    },
    extends: ['airbnb-base', 'prettier'],
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
        extends: [
          'airbnb-base',
          'plugin:@typescript-eslint/recommended',
          'prettier',
        ],
        files: ['src/**/*.{ts,tsx}', 'lib/**/*.{ts,tsx}'],
        parser: '@typescript-eslint/parser',
        parserOptions: {
          project: './tsconfig.app.json',
          tsconfigRootDir: dirname,
        },
        plugins: ['@typescript-eslint'],
        rules: {
          '@typescript-eslint/ban-ts-comment': [
            'error',
            {
              'ts-check': false,
              'ts-expect-error': 'allow-with-description',
              'ts-ignore': 'allow-with-description',
              'ts-nocheck': 'allow-with-description',
            },
          ],
          '@typescript-eslint/no-explicit-any': 'off',
          '@typescript-eslint/no-unused-vars': unusedVars,

          'class-methods-use-this': 'off',
          'import/extensions': [
            'error',
            'ignorePackages',
            {
              js: 'never',
              jsx: 'never',
              ts: 'never',
              tsx: 'never',
            },
          ],
          'import/prefer-default-export': 'off',
          'max-classes-per-file': 'off',
          'no-console': ['error', { allow: ['warn', 'error', 'info'] }],
          'no-param-reassign': 'off',
          'no-plusplus': 'off',
          'no-underscore-dangle': 'off',
        },
      },
      {
        extends: ['airbnb-base', 'prettier'],
        files: ['*.config.{js,ts}', 'esbuild.js'],
        parser: '@typescript-eslint/parser',
        parserOptions: {
          ecmaVersion: 'latest',
          sourceType: 'module',
        },
        plugins: ['@typescript-eslint'],
        rules: {
          'import/no-extraneous-dependencies': 'off',
          'no-console': 'off',
        },
      },
    ],
    parserOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
    },
    rules: {
      'class-methods-use-this': 'off',
      'import/extensions': [
        'error',
        'ignorePackages',
        // `ts: 'always'` is required because `lib/components/selfie/src/SelfieCaptureScreens.js`
        // imports a `.ts` helper directly. `tsx: 'always'` is required because
        // `lib/components/document/src/document-capture-instructions/index.js`
        // imports `./DocumentCaptureInstructions.tsx` for its custom-element
        // side-effect, alongside a sibling `.js` of the same basename. The
        // TS/TSX override below relaxes both back to `'never'` for files
        // already inside the TS sources.
        { js: 'never', jsx: 'never', ts: 'always', tsx: 'always' },
      ],
      'import/no-extraneous-dependencies': [
        'error',
        {
          devDependencies: [
            'esbuild.js',
            'cypress.config.js',
            '**/*{.,_,-}{test,spec}.js',
            '**/*{.,_,-}{test,spec}.ts',
            '**/*{.,_,-}{test,spec}.tsx',
            'cypress/**/*.js',
            'cypress/**/*.ts',
          ],
          optionalDependencies: false,
        },
      ],
      'max-classes-per-file': 'off',
      'no-console': ['error', { allow: ['warn', 'error', 'info'] }],
      'no-param-reassign': 'off',
      'no-plusplus': 'off',
      'no-underscore-dangle': 'off',
      'no-unused-vars': unusedVars,
      'prefer-destructuring': [
        'error',
        {
          array: false,
          object: true,
        },
        {
          enforceForRenamedProperties: false,
        },
      ],
      'sort-keys': 'error',
    },
    settings: {
      'import-x/resolver': {
        node: {
          // `.lottie` / `.svg` are bundler-only asset extensions; listing them
          // here lets eslint-plugin-import resolve them to the on-disk file
          // instead of flagging import/no-unresolved.
          extensions: ['.js', '.jsx', '.ts', '.tsx', '.lottie', '.svg'],
        },
        typescript: {
          alwaysTryTypes: true,
          project: './tsconfig.app.json',
        },
      },
    },
  }),
];
