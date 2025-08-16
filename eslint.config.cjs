const importPlugin = require('eslint-plugin-import');
const sortDestructureKeysPlugin = require('eslint-plugin-sort-destructure-keys');

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
      import: importPlugin,
    },
    rules: {
      // 🔑 Sort destructured object keys
      'sort-destructure-keys/sort-destructure-keys': [
        'error',
        { caseSensitive: false },
      ],

      // 🔑 Ensure dependencies are declared in package.json
      'import/no-extraneous-dependencies': 'error',

      // 🔑 Sort and group imports/requires (auto-fix enabled)
      'import/order': [
        'error',
        {
          groups: [
            'builtin', // Node.js built-ins (fs, path, etc.)
            'external', // npm packages
            'internal', // your own modules (like src/, @/)
            ['parent', 'sibling', 'index'], // relative imports
            'object', //
            'type', // TypeScript types
          ],
          'newlines-between': 'always',
          alphabetize: {
            order: 'asc', // A → Z
            caseInsensitive: true,
          },
        },
      ],

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
