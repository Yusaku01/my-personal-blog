import { describe, expect, it } from 'vitest';
import { getLocaleFromPath, stripLocalePrefix } from '../src/lib/i18n/utils';

describe('getLocaleFromPath', () => {
  describe('デフォルトロケール（ja）の判定', () => {
    it('ルートパスは ja を返す', () => {
      expect(getLocaleFromPath('/')).toBe('ja');
    });

    it('トップレベルページは ja を返す', () => {
      expect(getLocaleFromPath('/blog')).toBe('ja');
    });

    it('末尾スラッシュ付きでも ja を返す', () => {
      expect(getLocaleFromPath('/blog/')).toBe('ja');
    });

    it('ネストパスは ja を返す', () => {
      expect(getLocaleFromPath('/blog/some-post')).toBe('ja');
    });

    it('/profile は ja を返す', () => {
      expect(getLocaleFromPath('/profile')).toBe('ja');
    });

    it('/finds は ja を返す', () => {
      expect(getLocaleFromPath('/finds')).toBe('ja');
    });
  });

  describe('英語ロケールの判定', () => {
    it('/en は en を返す', () => {
      expect(getLocaleFromPath('/en')).toBe('en');
    });

    it('/en/ は en を返す', () => {
      expect(getLocaleFromPath('/en/')).toBe('en');
    });

    it('/en/blog は en を返す', () => {
      expect(getLocaleFromPath('/en/blog')).toBe('en');
    });

    it('/en/blog/some-post は en を返す', () => {
      expect(getLocaleFromPath('/en/blog/some-post')).toBe('en');
    });

    it('/en/profile は en を返す', () => {
      expect(getLocaleFromPath('/en/profile')).toBe('en');
    });

    it('/en/finds は en を返す', () => {
      expect(getLocaleFromPath('/en/finds')).toBe('en');
    });
  });

  describe('誤判定を防ぐエッジケース', () => {
    it('/enterprise は en と誤判定しない', () => {
      expect(getLocaleFromPath('/enterprise')).toBe('ja');
    });

    it('/enjoy/something は en と誤判定しない', () => {
      expect(getLocaleFromPath('/enjoy/something')).toBe('ja');
    });

    it('/entry は en と誤判定しない', () => {
      expect(getLocaleFromPath('/entry')).toBe('ja');
    });

    it('空文字列は ja を返す', () => {
      expect(getLocaleFromPath('')).toBe('ja');
    });

    it('大文字 /EN は locale として扱わない', () => {
      expect(getLocaleFromPath('/EN')).toBe('ja');
    });
  });
});

describe('stripLocalePrefix', () => {
  describe('デフォルトロケール（ja）のパスはそのまま返す', () => {
    it('/ はそのまま返す', () => {
      expect(stripLocalePrefix('/')).toBe('/');
    });

    it('/blog はそのまま返す', () => {
      expect(stripLocalePrefix('/blog')).toBe('/blog');
    });

    it('/blog/some-post はそのまま返す', () => {
      expect(stripLocalePrefix('/blog/some-post')).toBe('/blog/some-post');
    });
  });

  describe('英語 prefix を除去する', () => {
    it('/en は / を返す', () => {
      expect(stripLocalePrefix('/en')).toBe('/');
    });

    it('/en/ は / を返す', () => {
      expect(stripLocalePrefix('/en/')).toBe('/');
    });

    it('/en/blog は /blog を返す', () => {
      expect(stripLocalePrefix('/en/blog')).toBe('/blog');
    });

    it('/en/blog/some-post は /blog/some-post を返す', () => {
      expect(stripLocalePrefix('/en/blog/some-post')).toBe('/blog/some-post');
    });

    it('/en/profile は /profile を返す', () => {
      expect(stripLocalePrefix('/en/profile')).toBe('/profile');
    });
  });

  describe('誤除去を防ぐ', () => {
    it('/enterprise はそのまま返す', () => {
      expect(stripLocalePrefix('/enterprise')).toBe('/enterprise');
    });

    it('/enjoy/something はそのまま返す', () => {
      expect(stripLocalePrefix('/enjoy/something')).toBe('/enjoy/something');
    });
  });
});
