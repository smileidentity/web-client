module.exports = {
  env: {
    browser: true,
    commonjs: true,
    'cypress/globals': true,
    es2021: true,
  },
  extends: 'airbnb-base',
  ignorePatterns: [
    'build/',
    'instrumentation',
    'dist/',
    'libs/',
    'node_modules/',
  ],
  overrides: [
    {
      env: {
        node: true,
      },
      files: ['.eslintrc.{js,cjs}'],
      parserOptions: {
        sourceType: 'script',
      },
    },
    {
      files: ['**/*.{ts,tsx}'],
      parser: '@typescript-eslint/parser',
      plugins: ['@typescript-eslint'],
      extends: ['plugin:@typescript-eslint/recommended'],
      rules: {
        '@typescript-eslint/no-unused-vars': [
          'error',
          {
            args: 'after-used',
            ignoreRestSiblings: false,
            vars: 'all',
          },
        ],
        '@typescript-eslint/no-explicit-any': 'warn',
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
      },
    },
  ],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  plugins: ['cypress'],
  rules: {
    'class-methods-use-this': 'off',
    'function-paren-newline': 'off',
    'linebreak-style': 'off',
    'implicit-arrow-linebreak': 'off',
    'import/no-extraneous-dependencies': [
      'error',
      {
        devDependencies: [
          'esbuild.js',
          'cypress.config.js',
          '**/*{.,_,-}{test,spec}.js', // tests where the extension or filename suffix denotes that it is a test
        ],
        optionalDependencies: false,
      },
    ],
    indent: 0,
    'max-classes-per-file': 'off',
    'max-len': 'off',
    'object-curly-newline': 'off',
    'operator-linebreak': 'off',
    'no-console': ['error', { allow: ['warn', 'error', 'info'] }],
    'no-param-reassign': 'off',
    'no-plusplus': 'off',
    'no-underscore-dangle': 'off',
    'no-unused-vars': [
      'error',
      { args: 'after-used', ignoreRestSiblings: false, vars: 'all' },
    ],
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
    'import/resolver': {
      typescript: {
        alwaysTryTypes: true,
        project: './tsconfig.json',
      },
      node: {
        extensions: ['.js', '.jsx', '.ts', '.tsx'],
      },
      '../eslint-plugin-import-resolver.js': { someConfig: 1 },
    },
  },
};
