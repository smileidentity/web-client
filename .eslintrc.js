module.exports = {
  env: {
    browser: true,
    commonjs: true,
    es2021: true,
  },
  extends: 'airbnb-base',
  overrides: [
  ],
  parserOptions: {
    ecmaVersion: 'latest',
  },
  rules: {
    'max-len': 'off',
    indent: ['error', 2],
    'no-underscore-dangle': 'off',
    'no-console': ['error', { allow: ['warn', 'error', 'info'] }],
    'no-unused-vars': ['error', { vars: 'all', args: 'after-used', ignoreRestSiblings: false }],
  },
  env: {
    'cypress/globals': true,
  },
};
