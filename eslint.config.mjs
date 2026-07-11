import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
import css from '@eslint/css';

const require = createRequire(import.meta.url);

// Resolve ESLint's own dependency tree so this works even when these
// packages are not direct dependencies in package.json.
const eslintPackageJsonPath = require.resolve('eslint/package.json');
const eslintRequire = createRequire(eslintPackageJsonPath);

const { FlatCompat } = eslintRequire('@eslint/eslintrc');
const js = eslintRequire('@eslint/js');

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
});

export default [
  {
    ignores: ['dist/**/*', 'node_modules/**/*', '.astro/**/*', '.wrangler/**/*'],
  },
  {
    files: ['**/*.css'],
    plugins: {
      css,
    },
    language: 'css/css',
    rules: {
      'css/use-baseline': ['warn', { available: 'newly' }],
    },
  },
  ...compat
    .config({
      env: {
        node: true,
        browser: true,
        es2022: true,
      },
      extends: [
        'eslint:recommended',
        'plugin:@typescript-eslint/recommended',
        'plugin:astro/recommended',
        'plugin:jsx-a11y/recommended',
        'prettier',
      ],
      parser: '@typescript-eslint/parser',
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        project: './tsconfig.json',
      },
      plugins: ['@typescript-eslint', 'jsx-a11y', 'prettier'],
      rules: {
        'prettier/prettier': 'error',
        '@typescript-eslint/explicit-function-return-type': 'off',
        '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
        '@typescript-eslint/no-explicit-any': 'error',
      },
      overrides: [
        {
          files: ['*.astro'],
          parser: 'astro-eslint-parser',
          parserOptions: {
            parser: '@typescript-eslint/parser',
            extraFileExtensions: ['.astro'],
          },
          rules: {
            'astro/no-set-html-directive': 'error',
            '@typescript-eslint/no-unused-vars': 'off',
            'jsx-a11y/html-has-lang': 'off',
            // eslint-plugin-jsx-a11y が Astro lint 時に minimatch 互換で落ちるため無効化
            'jsx-a11y/label-has-associated-control': 'off',
            // Prettierのルールを緩和
            'prettier/prettier': 'warn',
          },
        },
        {
          files: ['src/env.d.ts'],
          rules: {
            '@typescript-eslint/triple-slash-reference': 'off',
            '@typescript-eslint/no-explicit-any': 'off',
          },
        },
      ],
    })
    .map((config) => ({
      ...config,
      ignores: [...(config.ignores ?? []), '**/*.css'],
    })),
];
