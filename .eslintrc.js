module.exports = {
  root: true,
  parserOptions: {
    parser: '@typescript-eslint/parser',
  },
  env: {
    browser: true,
    node: true,
  },
  extends: [
    'plugin:@typescript-eslint/recommended',
    'plugin:promise/recommended',
    'standard',
  ],
  plugins: [
    '@typescript-eslint',
    'promise',
  ],
  rules: {
    'comma-dangle': ['error', 'always-multiline'],
    semi: ['error', 'always'],
    'no-console': 'off',
    'no-new': 'off',
    indent: ['error', 2],
    'promise/catch-or-return': ['error', { allowThen: true, terminationMethod: ['catch', 'asCallback', 'finally'] }],
    '@typescript-eslint/array-type': ['error', { default: 'array' }],
    '@typescript-eslint/consistent-type-definitions': ['error', 'interface'],
  },
};
