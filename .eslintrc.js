module.exports = {
  env: {
    'cypress/globals': true,
    browser: true,
    commonjs: true,
    es2021: true,
  },
  extends: 'airbnb-base',
  ignorePatterns: [
    'build/',
    'dist/',
    'libs/',
    'node_modules/',
  ],
  globals: {
    validate: 'readonly',
    JSZip: 'readonly',
  },
  overrides: [
    {
      env: {
        node: true,
      },
      files: [
        '.eslintrc.{js,cjs}',
      ],
      parserOptions: {
        sourceType: 'script',
      },
    },
  ],
  parserOptions: {
    ecmaVersion: 'latest',
  },
  plugins: [
    'cypress',
  ],
  rules: {
    'class-methods-use-this': 0,
    'func-names': 0,
    'max-len': 0,
    'no-console': ['error', { allow: ['error'] }],
    'no-irregular-whitespace': 'error',
    'no-param-reassign': 0,
    'no-restricted-globals': 0,
    'no-tabs': 0,
    'no-use-before-define': 0,
    'no-useless-escape': 0,
    'one-var': ['error', 'never'],
    'prefer-destructuring': 0,
    camelcase: 0,
    indent: 0,
    strict: 0,
  },
};
