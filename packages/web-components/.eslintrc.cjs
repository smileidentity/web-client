module.exports = {
  env: {
    browser: true,
    es2021: true,
  },
  extends: 'airbnb-base',
  ignorePatterns: ['build/', 'dist/', 'libs/', 'node_modules/'],
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
    babelOptions: {
      plugins: [
        '@babel/plugin-syntax-import-assertions',
      ],
    },
  },
  rules: {
    'class-methods-use-this': 'off',
    indent: ['error', 2],
    'max-classes-per-file': 'off',
    'max-len': 'off',
    'no-console': ['error', { allow: ['warn', 'error', 'info'] }],
    'no-param-reassign': 'off',
    'no-plusplus': 'off',
    'no-underscore-dangle': 'off',
    'no-unused-vars': [
      'error',
    ],
  },
};
