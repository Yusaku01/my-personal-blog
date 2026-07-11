// SectionHeading が利用する UnoCSS クラスの組み合わせ。
export const heading = (
  options: {
    // size?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
    marginBottom?: 'sm' | 'md' | 'lg' | 'xl';
    className?: string;
  } = {}
) => {
  const { marginBottom = 'md', className = '' } = options;

  let classes = 'font-semibold text-gray-900 dark:text-white';

  // サイズのバリアント
  // if (size === 'h1') {
  //   classes += ' text-3xl lg:text-4xl';
  // } else if (size === 'h2') {
  //   classes += ' text-2xl lg:text-3xl';
  // } else if (size === 'h3') {
  //   classes += ' text-xl lg:text-2xl';
  // } else if (size === 'h4') {
  //   classes += ' text-lg lg:text-xl';
  // } else if (size === 'h5') {
  //   classes += ' text-base lg:text-lg';
  // }

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
