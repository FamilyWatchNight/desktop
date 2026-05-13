const js = require('@eslint/js');
const prettier = require('eslint-config-prettier');
const importPlugin = require('eslint-plugin-import');
const reactPlugin = require('eslint-plugin-react');
const globals = require('globals');
const tseslint = require('typescript-eslint');

module.exports = [
  // Ignore generated folders
  {
    ignores: ['dist/**', 'build/**', 'coverage/**'],
  },

  // Base JS recommendations
  js.configs.recommended,

  // TypeScript recommendations
  ...tseslint.configs.recommended,

  // Special handling for config files
  {
    files: ['**/*.{js,cjs,mjs}'],

    languageOptions: {
      globals: {
        ...globals.node,
      },
    },

    rules: {
      // Allow CommonJS require() in config files and scripts
      '@typescript-eslint/no-require-imports': 'off',
    },
  },

  {
    files: ['**/*.{ts,tsx}'],

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
          groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index'],

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
