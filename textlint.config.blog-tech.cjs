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
        // Each article keeps its own style; only mixing styles within one article is reported.
        preferInBody: '',
        preferInList: '',
        strict: false,
      },
      'ja-no-mixed-period': {
        // Casual endings are part of the blog's voice.
        allowPeriodMarks: ['〜', '...', '…', '笑'],
        allowEmojiAtEnd: true,
      },
      'no-exclamation-question-mark': false,
      'ja-no-weak-phrase': false,
      'max-kanji-continuous-len': false,
    },
  },
};
