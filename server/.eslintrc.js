module.exports = {
  env: {
    es6: true,
    node: true
  },
  extends: 'eslint:recommended',
  parserOptions: {
    ecmaFeatures: {
      ecmaVersion: 8
    }
  }
  rules: {
    indent: ['error', 2],
    'linebreak-style': ['error', 'unix'],
    quotes: ['error', 'single'],
    semi: ['error', 'always'],
    'no-unused-vars': 'error',
    'no-undef': 'error'
  }
};