import { defineConfig } from 'eslint/config';
import js from '@eslint/js';
import globals from 'globals';
import json from '@eslint/json';
import markdown from '@eslint/markdown';
import css from '@eslint/css';
import prettier from 'eslint-plugin-prettier';

export default defineConfig([
  // 🔥 Fully ignore launch.json from ever being linted
  {
    ignores: ['.vscode/launch.json', 'eslint.config.mjs'],
  },

  // 🔥 JavaScript / Node
  {
    files: ['**/*.{js,mjs,cjs}'],
    languageOptions: {
      ecmaVersion: 2021,
      sourceType: 'commonjs',
      globals: globals.node,
    },
    plugins: {
      js,
      prettier,
    },
    rules: {
      ...js.configs.recommended.rules,
      'require-await': 'error',
      'no-return-await': 'error',
      'no-async-promise-executor': 'error',
      'prettier/prettier': 'error',
      'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      'no-console': 'warn',
      'no-undef': 'error',
      'no-unreachable': 'error',
      'no-use-before-define': ['error', { functions: false, classes: true }],
      curly: 'error',
      'prefer-const': 'warn',
      'object-shorthand': 'warn',
    },
  },

  // 🔥 JSON — exclude JS to prevent false parsing
  {
    files: ['**/*.json'],
    plugins: { json },
    language: 'json/json',
    extends: ['json/recommended'],
  },

  // 🔥 Markdown code block linting
  {
    files: ['**/*.md'],
    plugins: { markdown },
    processor: 'markdown/markdown',
    extends: ['markdown/recommended'],
  },

  // 🔥 CSS
  {
    files: ['**/*.css'],
    plugins: { css },
    language: 'css/css',
    extends: ['css/recommended'],
  },
]);
