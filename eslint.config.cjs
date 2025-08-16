const sortDestructureKeysPlugin = require('eslint-plugin-sort-destructure-keys');

module.exports = [
  {
    files: ['**/*.js', '**/*.cjs'],
    plugins: {
      'sort-destructure-keys': sortDestructureKeysPlugin,
    },
    rules: {
      'sort-destructure-keys/sort-destructure-keys': [
        'error',
        { caseSensitive: false },
      ],
    },
  },
];
