const js = require('@eslint/js');
const tseslint = require('typescript-eslint');
const reactPlugin = require('eslint-plugin-react');
const importPlugin = require('eslint-plugin-import');
const prettier = require('eslint-config-prettier');

module.exports = [
  // Ignore generated folders
  {
    ignores: ['dist/**', 'build/**', 'coverage/**'],
  },

  // Base JS recommendations
  js.configs.recommended,

  // TypeScript recommendations
  ...tseslint.configs.recommended,

  {
    files: ['**/*.{ts,tsx,js,jsx}'],

    languageOptions: {
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
    },

    plugins: {
      react: reactPlugin,
      import: importPlugin,
    },

    settings: {
      react: {
        version: 'detect',
      },
    },

    rules: {
      // React 17+ JSX transform no longer requires React in scope
      'react/react-in-jsx-scope': 'off',

      // Stable import ordering
      'import/order': [
        'error',
        {
          groups: [
            'builtin',
            'external',
            'internal',
            'parent',
            'sibling',
            'index',
          ],

          'newlines-between': 'always',

          alphabetize: {
            order: 'asc',
            caseInsensitive: true,
          },
        },
      ],
    },
  },

  // IMPORTANT:
  // Disables formatting rules that conflict with Prettier
  prettier,
];