/* eslint-disable @typescript-eslint/no-require-imports */
const baseConfig = require('./textlint.config.blog-base.cjs');

module.exports = {
  ...baseConfig,
  rules: {
    ...baseConfig.rules,
    'preset-japanese': {
      ...baseConfig.rules['preset-japanese'],
      'sentence-length': false,
    },
    'preset-ja-technical-writing': {
      'sentence-length': {
        max: 120,
      },
      'no-mix-dearu-desumasu': {
        preferInHeader: '',
        preferInBody: 'ですます',
        preferInList: 'ですます',
        strict: false,
      },
      'no-exclamation-question-mark': false,
      'ja-no-weak-phrase': false,
      'max-kanji-continuous-len': false,
    },
  },
};
