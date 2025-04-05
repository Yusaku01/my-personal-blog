module.exports = {
  root: true,
  env: {
    node: true,
    browser: true,
    es2022: true,
  },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:astro/recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
    'plugin:jsx-a11y/recommended',
    'prettier',
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    project: './tsconfig.json',
  },
  plugins: ['@typescript-eslint', 'react', 'jsx-a11y', 'prettier'],
  rules: {
    'prettier/prettier': 'error',
    'react/react-in-jsx-scope': 'off',
    'react/prop-types': 'off',
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    '@typescript-eslint/no-explicit-any': 'error',
  },
  settings: {
    react: {
      version: 'detect',
    },
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
        // Astroファイルではclassを使うので無効化
        'react/no-unknown-property': 'off', // Astroファイル内ではこのルールを完全に無効化
        'jsx-a11y/html-has-lang': 'off', // Astroファイル内ではこのルールも無効化
        // MapでJSX使う場合のkey警告を無効化
        'react/jsx-key': 'off',
        // Prettierのルールを緩和
        'prettier/prettier': 'warn',
      },
    },
    // env.d.ts用のルール設定
    {
      files: ['src/env.d.ts'],
      rules: {
        '@typescript-eslint/triple-slash-reference': 'off',
        '@typescript-eslint/no-explicit-any': 'off', // env.d.tsでは any 型を許可
      },
    },
  ],
  // distディレクトリを無視
  ignorePatterns: ['dist/**/*', 'node_modules/**/*'],
};
