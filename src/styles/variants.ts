import { tv } from 'tailwind-variants';

export const button = tv({
  base: 'transition-colors font-medium shadow-sm hover:shadow focus:outline-none focus:ring-2 focus:ring-offset-2',
  variants: {
    color: {
      primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
      secondary: 'bg-gray-200 text-gray-700 hover:bg-gray-300 focus:ring-gray-500',
    },
    size: {
      sm: 'px-3 py-1.5 text-sm rounded',
      md: 'px-4 py-2 text-base rounded-md',
      lg: 'px-6 py-3 text-lg rounded-lg',
    },
    fullWidth: {
      true: 'w-full',
    },
    disabled: {
      true: 'opacity-50 cursor-not-allowed',
    },
  },
  defaultVariants: {
    color: 'primary',
    size: 'md',
    fullWidth: false,
    disabled: false,
  },
});

export const input = tv({
  base: 'w-full border rounded-md focus:outline-none focus:ring-2 focus:ring-offset-0 transition-colors',
  variants: {
    color: {
      primary: 'border-gray-300 focus:border-blue-500 focus:ring-blue-500',
      error: 'border-red-300 focus:border-red-500 focus:ring-red-500',
    },
    size: {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-3 py-2 text-base',
      lg: 'px-4 py-3 text-lg',
    },
    disabled: {
      true: 'bg-gray-100 cursor-not-allowed',
    },
  },
  defaultVariants: {
    color: 'primary',
    size: 'md',
    disabled: false,
  },
});

export const card = tv({
  base: 'bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden border border-gray-200 dark:border-gray-700 transition-all duration-200 h-full',
  variants: {
    hoverable: {
      true: 'hover:shadow-md',
    },
  },
  defaultVariants: {
    hoverable: true,
  },
});

export const heading = tv({
  base: 'font-semibold text-gray-900 dark:text-white',
  variants: {
    size: {
      h1: 'text-4xl',
      h2: 'text-3xl',
      h3: 'text-2xl',
      h4: 'text-xl',
      h5: 'text-lg',
      h6: 'text-base',
    },
    marginBottom: {
      sm: 'mb-2',
      md: 'mb-4',
      lg: 'mb-6',
      xl: 'mb-8',
    },
  },
  defaultVariants: {
    size: 'h2',
    marginBottom: 'md',
  },
});