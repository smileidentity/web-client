module.exports = {
  env: {
    browser: true,
    commonjs: true,
    'cypress/globals': true,
    es2021: true,
  },
  extends: ['airbnb-base', 'prettier'],
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
      extends: ['airbnb-base', 'plugin:@typescript-eslint/recommended', 'prettier'],
      files: ['src/**/*.{ts,tsx}', 'lib/**/*.{ts,tsx}'],
      parser: '@typescript-eslint/parser',
      parserOptions: {
        project: './tsconfig.app.json',
      },
      plugins: ['@typescript-eslint'],
      rules: {
        '@typescript-eslint/no-explicit-any': 'off',
        '@typescript-eslint/no-unused-vars': [
          'error',
          {
            args: 'after-used',
            ignoreRestSiblings: false,
            vars: 'all',
          },
        ],

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
  plugins: ['cypress'],
  rules: {
    'class-methods-use-this': 'off',
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
      node: {
        extensions: ['.js', '.jsx', '.ts', '.tsx'],
      },
      typescript: {
        alwaysTryTypes: true,
        project: './tsconfig.app.json',
      },
    },
  },
};
