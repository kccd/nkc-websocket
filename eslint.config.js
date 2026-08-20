const js = require('@eslint/js');
const tseslint = require('@typescript-eslint/eslint-plugin');
const prettier = require('eslint-plugin-prettier');
const configPrettier = require('eslint-config-prettier');

module.exports = [
  {
    ignores: [
      'dist/**',
      'doc/**',
      'logs/**',
      'node_modules/**',
      '**/*.js',
      '**/*.cjs',
      '**/*.mjs',
      '**/*.yaml',
      '**/*.yml',
      '**/*.json',
    ],
  },
  js.configs.recommended,
  ...tseslint.configs['flat/recommended'],
  ...tseslint.configs['flat/recommended-type-checked'],
  {
    name: 'project/parser-options',
    files: ['**/*.ts', '**/*.tsx', '**/*.mts', '**/*.cts'],
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: __dirname,
      },
    },
  },
  {
    name: 'project/rules',
    rules: {
      '@typescript-eslint/no-misused-promises': 'off',
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          varsIgnorePattern: '^_',
          argsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],
    },
  },
  {
    name: 'prettier',
    plugins: {
      prettier,
    },
    rules: {
      'prettier/prettier': 'error',
      'arrow-body-style': 'off',
      'prefer-arrow-callback': 'off',
    },
  },
  configPrettier,
];
