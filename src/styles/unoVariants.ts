/**
 * UnoCSSとの連携のためのスタイルユーティリティ関数
 * コンポーネントのスタイル変数と関数を定義します
 */

// 基本型定義
type VariantOption = string | boolean | undefined;
type VariantProps = Record<string, VariantOption>;
type VariantOptions = Record<string, Record<string, string>>;
type DefaultVariants = Record<string, string>;

/**
 * コンポーネントのバリアントを作成するユーティリティ関数
 * @param base ベースとなるクラス名
 * @param variants バリアントオプション
 * @param defaultVariants デフォルトのバリアント
 * @returns クラス名を生成する関数
 */
export function createVariants(
  base: string,
  variants: VariantOptions,
  defaultVariants: DefaultVariants = {}
) {
  return (props: VariantProps = {}) => {
    let classes = base;

    // 各バリアントを処理
    Object.entries(variants).forEach(([key, options]) => {
      const value = props[key] ?? defaultVariants[key];
      if (value && options[value.toString()]) {
        classes += ' ' + options[value.toString()];
      }
    });

    // クラス名プロパティがある場合は追加
    if (props.className) {
      classes += ' ' + props.className;
    }

    return classes;
  };
}

// ボタンスタイル
export const button = (
  options: {
    color?: 'primary' | 'secondary';
    size?: 'sm' | 'md' | 'lg';
    fullWidth?: boolean;
    disabled?: boolean;
  } = {}
) => {
  const { color = 'primary', size = 'md', fullWidth = false, disabled = false } = options;

  let classes = 'transition-colors font-medium focus:outline-none focus:ring-2 focus:ring-offset-2';

  // 色のバリアント
  if (color === 'primary') {
    classes +=
      ' px-6 py-3 bg-gray-800 text-white rounded-md lg:hover:bg-gray-700 transition-all duration-300 dark:bg-gray-200 dark:text-gray-800 font-bold leading-loose';
  } else if (color === 'secondary') {
    classes += ' bg-gray-200 text-gray-700 lg:hover:bg-gray-300 focus:ring-gray-500';
  }

  // サイズのバリアント
  if (size === 'sm') {
    classes += ' px-3 py-1.5 text-sm rounded';
  } else if (size === 'md') {
    classes += ' px-4 py-2 text-base rounded-md';
  } else if (size === 'lg') {
    classes += ' px-6 py-3 text-lg rounded-lg';
  }

  // 幅のバリアント
  if (fullWidth) {
    classes += ' w-full';
  }

  // 無効状態のバリアント
  if (disabled) {
    classes += ' opacity-50 cursor-not-allowed';
  }

  return classes;
};

// 入力フィールドスタイル
export const input = (
  options: {
    color?: 'primary' | 'error';
    size?: 'sm' | 'md' | 'lg';
    rounded?: 'sm' | 'md' | 'lg' | 'full' | 'none';
    disabled?: boolean;
  } = {}
) => {
  const { color = 'primary', size = 'md', rounded = 'md', disabled = false } = options;

  let classes =
    'w-full border rounded-md focus:outline-none focus:ring-2 focus:ring-offset-0 transition-colors';

  // 色のバリアント
  if (color === 'primary') {
    classes += ' border-gray-300 focus:border-blue-500 focus:ring-blue-500';
  } else if (color === 'error') {
    classes += ' border-red-300 focus:border-red-500 focus:ring-red-500';
  }

  // サイズのバリアント
  if (size === 'sm') {
    classes += ' px-3 py-1.5 text-sm';
  } else if (size === 'md') {
    classes += ' px-3 py-2 text-base';
  } else if (size === 'lg') {
    classes += ' px-4 py-3 text-lg';
  }

  // 角丸のバリアント
  if (rounded === 'sm') {
    classes += ' rounded';
  } else if (rounded === 'md') {
    classes += ' rounded-md';
  } else if (rounded === 'lg') {
    classes += ' rounded-lg';
  } else if (rounded === 'full') {
    classes += ' rounded-full';
  } else if (rounded === 'none') {
    classes += ' rounded-none';
  }

  // 無効状態のバリアント
  if (disabled) {
    classes += ' bg-gray-100 cursor-not-allowed';
  }

  return classes;
};

// カードスタイル
export const card = (options: { hoverable?: boolean } = {}) => {
  const { hoverable = true } = options;

  let classes =
    'bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden border border-gray-200 dark:border-gray-700 transition-all duration-200 h-full';

  if (hoverable) {
    classes += ' lg:hover:shadow-md';
  }

  return classes;
};

// 見出しスタイル
export const heading = (
  options: {
    size?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
    marginBottom?: 'sm' | 'md' | 'lg' | 'xl';
    className?: string;
  } = {}
) => {
  const { size = 'h2', marginBottom = 'md', className = '' } = options;

  let classes = 'font-semibold text-gray-900 dark:text-white';

  // サイズのバリアント
  if (size === 'h1') {
    classes += ' text-4xl';
  } else if (size === 'h2') {
    classes += ' text-3xl';
  } else if (size === 'h3') {
    classes += ' text-2xl';
  } else if (size === 'h4') {
    classes += ' text-xl';
  } else if (size === 'h5') {
    classes += ' text-lg';
  } else if (size === 'h6') {
    classes += ' text-base';
  }

  // 下マージンのバリアント
  if (marginBottom === 'sm') {
    classes += ' mb-2';
  } else if (marginBottom === 'md') {
    classes += ' mb-4';
  } else if (marginBottom === 'lg') {
    classes += ' mb-6';
  } else if (marginBottom === 'xl') {
    classes += ' mb-8';
  }

  // 追加のクラス名
  if (className) {
    classes += ` ${className}`;
  }

  return classes;
};
