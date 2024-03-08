module.exports = {
  env: {
    browser: true,
    commonjs: true,
    'cypress/globals': true,
    es2021: true,
  },
  extends: 'airbnb-base',
  ignorePatterns: ['build/', 'instrumentation', 'dist/', 'libs/', 'node_modules/'],
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
  ],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  plugins: [
    'cypress',
  ],
  rules: {
    'class-methods-use-this': 'off',
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
    indent: ['error', 2],
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
    indent: ['error', 2],
    'max-classes-per-file': 'off',
    'max-len': 'off',
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
};
