import { defineConfig } from 'eslint/config';
import js from '@eslint/js';
import tsPlugin from '@typescript-eslint/eslint-plugin';
import angular from 'angular-eslint';

export default defineConfig([
  { ignores: ['node_modules/**', 'dist/**', 'coverage/**', '.angular/**'] },
  {
    files: ['**/*.ts'],
    extends: [
      js.configs.recommended,
      ...tsPlugin.configs['flat/recommended'],
      ...angular.configs.tsRecommended,
    ],
    processor: angular.processInlineTemplates,
    rules: {
      // Keep the pre-upgrade change detection behavior preserved by Angular migrations.
      '@angular-eslint/prefer-on-push-component-change-detection': 'off',
      '@angular-eslint/directive-selector': ['error', {
        type: 'attribute', prefix: 'app', style: 'camelCase',
      }],
      '@angular-eslint/component-selector': ['error', {
        type: 'element', prefix: 'app', style: 'kebab-case',
      }],
    },
  },
  {
    files: ['**/*.html'],
    extends: [
      ...angular.configs.templateRecommended,
      ...angular.configs.templateAccessibility,
    ],
  },
]);
