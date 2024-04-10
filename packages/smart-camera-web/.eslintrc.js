module.exports = {
  env: {
    browser: true,
    commonjs: true,
    'cypress/globals': true,
    es2021: true,
  },
  extends: 'airbnb-base',
  ignorePatterns: ['cypress/pages/instrumented/**', 'node_modules/'],
  parserOptions: {
    ecmaVersion: 'latest',
  },
  plugins: ['cypress'],
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
    'no-unused-vars': [
      'error',
      { args: 'after-used', ignoreRestSiblings: false, vars: 'all' },
    ],
    'sort-keys': 'error',
  },
};
