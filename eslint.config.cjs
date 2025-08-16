const sortDestructureKeysPlugin = require('eslint-plugin-sort-destructure-keys');
const importPlugin = require('eslint-plugin-import');

module.exports = [
  {
    files: ['**/*.js', '**/*.cjs'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        process: 'readonly',
        console: 'readonly',
        __dirname: 'readonly',
      },
    },
    plugins: {
      'sort-destructure-keys': sortDestructureKeysPlugin,
      import: importPlugin, // 👈 you missed this!
    },
    rules: {
      // 🔑 Your existing logic
      'sort-destructure-keys/sort-destructure-keys': [
        'error',
        { caseSensitive: false },
      ],

      // ✅ Now ESLint knows where this rule comes from
      'import/no-extraneous-dependencies': 'error',

      // ✅ Best practices
      eqeqeq: ['error', 'always'],
      'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      'no-console': 'warn',
      'no-else-return': 'error',
      curly: ['error', 'all'],

      // ✅ Style
      indent: ['error', 2, { SwitchCase: 1 }],
      quotes: ['error', 'single', { avoidEscape: true }],
      semi: ['error', 'always'],
      'object-curly-spacing': ['error', 'always'],
      'array-bracket-spacing': ['error', 'never'],
      'comma-dangle': ['error', 'always-multiline'],

      // ✅ Node.js specific
      'callback-return': 'off',
      'handle-callback-err': 'warn',
      'no-buffer-constructor': 'error',
      'no-mixed-requires': 'warn',
      'no-new-require': 'error',
      'global-require': 'off',
    },
  },
];
