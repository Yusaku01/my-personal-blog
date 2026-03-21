module.exports = {
  plugins: {
    mdx: true,
  },
  filters: {
    comments: true,
  },
  rules: {
    'preset-japanese': {
      'sentence-length': {
        max: 140,
      },
      'no-mix-dearu-desumasu': false,
    },
    'preset-ja-spacing': true,
  },
};
