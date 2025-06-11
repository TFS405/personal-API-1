const js = require('@eslint/js');
const globals = require('globals');
const json = require('@eslint/json');
const markdown = require('@eslint/markdown');
const css = require('@eslint/css');
const prettierPlugin = require('eslint-plugin-prettier');
const { defineConfig } = require('eslint/config');

export default defineConfig([
  // Core JavaScript / Node.js configuration
  {
    files: ['**/*.{js,mjs,cjs}'],
    languageOptions: {
      ecmaVersion: 2021,
      sourceType: 'commonjs',
      globals: globals.node,
    },
    plugins: {
      js,
      prettier: prettierPlugin,
    },
    rules: {
      ...js.configs.recommended.rules,

      // Async & Await best practices
      'require-await': 'error', // Flag async functions with no await
      'no-return-await': 'error', // Disallow redundant return await
      'no-async-promise-executor': 'error', // Prevent async promise executors

      // Prettier
      'prettier/prettier': 'error',

      // Clean code
      'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      'no-console': 'off',
    },
  },

  // JSON files (standard, JSONC, JSON5)
  {
    files: ['**/*.json'],
    plugins: { json },
    language: 'json/json',
    extends: ['json/recommended'],
  },
  {
    files: ['**/*.jsonc'],
    plugins: { json },
    language: 'json/jsonc',
    extends: ['json/recommended'],
  },
  {
    files: ['**/*.json5'],
    plugins: { json },
    language: 'json/json5',
    extends: ['json/recommended'],
  },

  // Markdown (lint code blocks in `.md` files)
  {
    files: ['**/*.md'],
    plugins: { markdown },
    language: 'markdown/gfm',
    extends: ['markdown/recommended'],
  },

  // CSS linting
  {
    files: ['**/*.css'],
    plugins: { css },
    language: 'css/css',
    extends: ['css/recommended'],
  },
]);
