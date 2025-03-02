import { defineConfig, presetUno, presetAttributify, presetTypography } from 'unocss';
import transformerVariantGroup from '@unocss/transformer-variant-group';
import transformerDirectives from '@unocss/transformer-directives';

export default defineConfig({
  presets: [
    presetUno(), // Tailwind互換の基本機能
    presetAttributify(), // 属性ベースのユーティリティ
    presetTypography(), // Tailwindの@tailwindcss/typographyの代替
  ],
  transformers: [
    transformerVariantGroup(), // バリアント機能の拡張
    transformerDirectives(), // CSSディレクティブ
  ],
  theme: {
    // tailwind.config.mjsからの設定移行
    screens: {
      sm: '640px',
      md: '768px',
      lg: '1024px',
      xl: '1280px',
      '2xl': '1536px',
    },
    extend: {
      typography: {
        DEFAULT: {
          css: {
            maxWidth: 'none',
          },
        },
      },
    },
  },
  // カスタムルールや省略形
  shortcuts: {
    // カードコンポーネント用の省略形
    'card-base':
      'bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden border border-gray-200 dark:border-gray-700 transition-all duration-200 h-full',
    'card-hoverable': 'hover:shadow-md',

    // ボタン用の省略形
    'btn-base':
      'transition-colors font-medium shadow-sm hover:shadow focus:outline-none focus:ring-2 focus:ring-offset-2',
    'btn-primary':
      'px-6 py-3 bg-[#333] text-white rounded-md hover:opacity-70 transition-all duration-300 dark:bg-white dark:text-[#333] font-bold leading-loose',
    'btn-secondary': 'bg-gray-200 text-gray-700 hover:bg-gray-300 focus:ring-gray-500',

    // サイズバリアント
    'btn-sm': 'px-3 py-1.5 text-sm rounded',
    'btn-md': 'px-4 py-2 text-base rounded-md',
    'btn-lg': 'px-6 py-3 text-lg rounded-lg',

    // 入力フィールド用の省略形
    'input-base':
      'w-full border rounded-md focus:outline-none focus:ring-2 focus:ring-offset-0 transition-colors',
    'input-primary': 'border-gray-300 focus:border-blue-500 focus:ring-blue-500',
    'input-error': 'border-red-300 focus:border-red-500 focus:ring-red-500',

    // 見出し用の省略形
    'heading-base': 'font-semibold text-gray-900 dark:text-white',
    'heading-h1': 'text-4xl',
    'heading-h2': 'text-3xl',
    'heading-h3': 'text-2xl',
    'heading-h4': 'text-xl',
    'heading-h5': 'text-lg',
    'heading-h6': 'text-base',

    // ブログ関連の省略形
    'blog-search-form': 'mb-8 max-w-xl mx-auto relative',
    'blog-search-input':
      'w-full px-4 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-[#333] bg-white dark:bg-white dark:border-none',
    'blog-search-button':
      'absolute top-0 right-0 px-4 py-2 text-sm bg-[#333] text-white hover:opacity-70 transition-all duration-300 rounded-r-md h-full font-bold leading-loose dark:border-none',
    'blog-post-grid': 'grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
    'blog-load-more-button':
      'px-6 py-2 bg-[#333] text-white rounded-md hover:opacity-70 transition-all duration-300 dark:bg-white dark:text-[#333] font-bold leading-loose',
    'blog-post-card':
      'bg-white dark:bg-[#222] rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow border border-gray-200 dark:border-gray-700',

    'blog-post-title': 'text-lg font-medium text-gray-900 dark:text-white mb-2 line-clamp-2',
    'blog-post-excerpt': 'text-sm text-gray-600 dark:text-gray-400 line-clamp-2',
    'blog-post-tag':
      'text-xs text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700 rounded-lg px-2',
  },
  // 動的に生成されるクラスでPurgeされないようにするリスト
  safelist: [],
});
