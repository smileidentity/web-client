module.exports = {
  env: {
    browser: true,
    commonjs: true,
    'cypress/globals': true,
    es2021: true,
  },
  extends: 'airbnb-base',
  ignorePatterns: [
    'cypress/pages/instrumented/**',
    'node_modules/',
  ],
  parserOptions: {
    ecmaVersion: 'latest',
  },
  plugins: [
    'cypress',
  ],
  rules: {
    indent: ['error', 2],
    'max-classes-per-file': 'off',
    'max-len': 'off',
    'no-console': ['error', { allow: ['warn', 'error', 'info'] }],
    'no-plusplus': 'off',
    'no-underscore-dangle': 'off',
    'no-unused-vars': ['error', { args: 'after-used', ignoreRestSiblings: false, vars: 'all' }],
    'sort-keys': 'error',
  },
};
