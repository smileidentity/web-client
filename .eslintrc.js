module.exports = {
  env: {
    'cypress/globals': true,
    browser: true,
    commonjs: true,
    es2021: true,
  },
  extends: 'airbnb-base',
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
    camelcase: 0,
    'no-tabs': 0,
    indent: 0,
    strict: 0,
  },
};
