module.exports = {
  env: {
    "cypress/globals": true,
    browser: true,
    commonjs: true,
    es2021: true,
  },
  extends: ["airbnb-base", "plugin:prettier/recommended"],
  ignorePatterns: ["build/", "dist/", "libs/", "node_modules/"],
  globals: {
    validate: "readonly",
    JSZip: "readonly",
  },
  overrides: [
    {
      env: {
        node: true,
      },
      files: [".eslintrc.{js,cjs}"],
      parserOptions: {
        sourceType: "script",
      },
    },
  ],
  parserOptions: {
    ecmaVersion: "latest",
  },
  plugins: ["cypress", "prettier"],
  rules: {
    "class-methods-use-this": 0,
    "func-names": 0,
    "import/no-extraneous-dependencies": ["error", { devDependencies: true }],
    "max-len": 0,
    "no-console": ["error", { allow: ["error"] }],
    "no-param-reassign": 0,
    "no-restricted-globals": 0,
    "no-use-before-define": 0,
    "no-useless-escape": 0,
    "one-var": ["error", "never"],
    "prefer-destructuring": 0,
    "prettier/prettier": "error",
    camelcase: 0,
    indent: 0,
    strict: 0,
  },
};
