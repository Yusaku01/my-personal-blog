import {
  defineConfig,
  presetAttributify,
  presetTypography,
  presetWind3,
  presetIcons,
} from 'unocss';
import transformerVariantGroup from '@unocss/transformer-variant-group';
import transformerDirectives from '@unocss/transformer-directives';

export default defineConfig({
  presets: [
    presetWind3(), // Tailwind互換の基本機能
    presetAttributify(), // 属性ベースのユーティリティ
    presetTypography(), // Tailwindの@tailwindcss/typographyの代替
    presetIcons({
      scale: 1.2,
      mode: 'auto',
      prefix: 'i-',
      extraProperties: {
        display: 'inline-block',
        'vertical-align': 'middle',
      },
      collections: {
        ic: () => import('@iconify-json/ic/icons.json').then((i) => i.default),
      },
      // cdn: 'https://esm.sh/', // ← collections指定したら不要です
    }),
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
      colors: {
        // モノトーンカラーパレットの拡張
        gray: {
          50: '#f9fafb',
          100: '#f3f4f6',
          200: '#e5e7eb',
          300: '#d1d5db',
          400: '#9ca3af',
          500: '#6b7280',
          600: '#4b5563',
          700: '#374151',
          800: '#1f2937',
          900: '#111827',
          950: '#030712',
        },
      },
    },
  },
  // カスタムルールや省略形
  shortcuts: {
    // コンテナ用の省略形
    'container-base': 'px-4 mx-auto',
    'container-sm': 'max-w-2xl px-4 mx-auto',
    'container-md': 'max-w-4xl px-4 mx-auto',
    'container-lg': 'max-w-[1132px] px-4 mx-auto',
    'container-xl': 'max-w-6xl px-4 mx-auto',
    'container-2xl': 'max-w-7xl px-4 mx-auto',

    // カードコンポーネント用の省略形
    'card-base':
      'bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden border border-gray-200 dark:border-gray-700 transition-all duration-200 h-full',
    'card-hoverable': 'lg:hover:shadow-md',

    // ボタン用の省略形
    'btn-primary':
      'px-6 py-3 bg-gray-800 text-white rounded-md lg:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors disabled:opacity-70 dark:bg-white dark:text-gray-900 dark:lg:hover:bg-gray-300 dark:focus:ring-gray-300 dark:focus:ring-offset-gray-300 font-bold tracking-wide',

    // サイズバリアント
    'btn-sm': 'px-3 py-1.5 text-sm rounded',
    'btn-md': 'px-4 py-2 text-base rounded-md',
    'btn-lg': 'px-6 py-3 text-lg rounded-lg',

    // 入力フィールド用の省略形
    'input-base':
      'w-full border rounded-md focus:outline-none focus:ring-2 focus:ring-offset-0 transition-colors',
    'input-primary': 'border-gray-300 focus:border-gray-500 focus:ring-gray-500',
    'input-error': 'border-red-300 focus:border-red-500 focus:ring-red-500',

    // 見出し用の省略形
    'heading-base': 'font-semibold text-gray-900 dark:text-white',
    'heading-h1': 'text-3xl lg:text-5xl',
    'heading-h2': 'text-2xl lg:text-4xl',
    'heading-h3': 'text-xl lg:text-3xl',
    'heading-h4': 'text-lg lg:text-2xl',
    'heading-h5': 'text-base lg:text-xl',
    'heading-h6': 'text-base',

    // ブログ関連の省略形
    'blog-search-form': 'mb-8 max-w-xl mx-auto relative',
    'blog-search-input':
      'w-full px-4 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 bg-white dark:bg-white dark:border-none',
    'blog-search-button':
      'absolute top-0 right-0 px-4 py-2 text-sm bg-gray-800 text-white lg:hover:opacity-70 transition-all duration-300 rounded-r-md h-full font-bold leading-loose dark:border-none',
    'blog-post-grid': 'grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
    'blog-load-more-button':
      'mx-auto mt-8 px-6 py-2 bg-gray-800 text-white rounded-md lg:hover:opacity-70 transition-all duration-300 dark:bg-gray-200 dark:text-gray-800 font-bold',
  },
  rules: [],
});
