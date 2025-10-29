/// <reference path="../.astro/types.d.ts" />
/* Astro types import */
import type {} from '../.astro/types';
/// <reference types="astro/client" />

// Window 拡張
type DataLayerEvent = unknown;
interface Window {
  dataLayer: DataLayerEvent[];
}

// gtag関数をグローバルに追加
declare global {
  function gtag(...args: unknown[]): void;
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
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface ImgHTMLAttributes<T> {
    fetchPriority?: 'high' | 'low' | 'auto';
  }
}

// reCAPTCHA の型定義
interface ReCaptchaInstance {
  render: (container: HTMLElement | string, parameters: any) => number;
  getResponse: (widgetId: number) => string;
  reset: (widgetId: number) => void;
}

declare global {
  interface Window {
    grecaptcha?: ReCaptchaInstance;
  }
}
