/// <reference path="../.astro/types.d.ts" />
/* Astro types import */
import type {} from '../.astro/types';
/// <reference types="astro/client" />

// WindowオブジェクトにdataLayerプロパティを追加
interface Window {
  dataLayer: any[]; // または Array<any> や、より具体的な型
}

// gtag関数をグローバルに追加
declare global {
  function gtag(...args: any[]): void; // any[] はより具体的な型にすることも可能
}

// Google Analytics IDを環境変数から取得
interface ImportMetaEnv {
  readonly PUBLIC_GOOGLE_ANALYTICS_ID: string;
}

// ImportMetaEnvをグローバルに追加
interface ImportMeta {
  readonly env: ImportMetaEnv;
}

// React HTML要素の型定義を拡張
declare module 'react' {
  interface ImgHTMLAttributes<T = unknown> extends HTMLAttributes<T> {
    fetchPriority?: 'high' | 'low' | 'auto';
  }
}
