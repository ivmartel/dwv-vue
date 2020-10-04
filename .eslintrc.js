module.exports = {
  root: true,
  env: {
    node: true
  },
  extends: ['plugin:vue/essential', 'eslint:recommended'],
  rules: {
    'no-console': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    // stay in vue style, no semi colon at end of line
    semi: ['error', 'never'],
    // force single quotes (default 'double')
    quotes: ['error', 'single'],
    // no space for named functions (default 'always')
    'space-before-function-paren': ['error', { named: 'never' }]
  },
  parserOptions: {
    parser: 'babel-eslint'
  }
}
