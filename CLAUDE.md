# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## よく使う開発コマンド

```bash
# 開発サーバーの起動（ポート4321）
npm run dev

# 本番用ビルド
npm run build

# OGP画像生成付きビルド
npm run build:with-ogp

# 本番ビルドのプレビュー
npm run preview

# リンティング
npm run lint        # リントエラーのチェック
npm run lint:fix    # リントエラーの自動修正

# フォーマット
npm run format       # 全ファイルのフォーマット
npm run format:check # 変更なしでフォーマットチェック
```

## アーキテクチャ概要

このプロジェクトはAstroベースの個人ブログで、以下の技術を使用しています：

- **Astro v5.13.0** - 静的サイト生成
- **React v18.3** - インタラクティブコンポーネント（.tsxファイル）
- **UnoCSS v0.63.6** - スタイリング（Tailwind互換のアトミックCSS）
- **MDX** - コンポーネントサポート付きブログコンテンツ
- **TypeScript v5.6** - 型安全性

### 主要ディレクトリ

- `src/pages/` - ファイルベースルーティング（Astroページ）
- `src/components/` - 再利用可能なUIコンポーネント（Astro/React）
- `src/content/blog/` - MDX形式のブログ記事
- `src/lib/api-clients/` - 外部API統合（Qiita、お問い合わせフォーム）
- `public/` - 直接配信される静的アセット

### 重要なアーキテクチャパターン

1. **ハイブリッドコンポーネント構成**

   - Astroコンポーネント (.astro): 静的なUI、サーバーサイド処理
   - Reactコンポーネント (.tsx): インタラクティブ要素（フォーム、状態管理）
   - 機能別ディレクトリ構成（Blog/、Contact/、Header/など）

2. **外部コンテンツ統合**

   - Qiita API統合（`src/lib/api-clients/qiita.ts`）
   - Zenn API統合（`src/lib/api-clients/zenn.ts`）
   - メモリキャッシュ（1時間TTL）による API レスポンス最適化
   - OGP画像の自動取得とサムネイル生成

3. **コンテンツコレクション**

   - Zodスキーマ検証を使用したAstroのコンテンツコレクション（`src/content/config.ts`）
   - MDX形式でのブログ記事管理
   - 静的パス生成による高速レンダリング

4. **フォーム処理アーキテクチャ**

   - React Hook Form + Zodによる型安全なバリデーション
   - SSGForm（外部フォームサービス）との統合
   - `ContactForm.tsx`での状態管理とエラーハンドリング

5. **OGP画像生成ワークフロー**

   - `pages/api/og/[...slug].astro`: 動的OGP画像生成API
   - `scripts/build-ogp.js`: Puppeteerによる自動画像生成
   - **重要**: OGP画像生成には開発サーバーの起動が必要（localhost:4321）

6. **マークダウンエクスポート**
   - `pages/blog/[...slug].md.ts`: ブログ記事の生Markdownを取得するAPIエンドポイント
   - フロントマターを除去したクリーンなMarkdown出力

### スタイリングシステム

- **UnoCSS**: Tailwind互換のアトミック CSS
- **カスタムショートカット**: `uno.config.ts`で定義
  - `container-*`: レスポンシブコンテナ
  - `card-*`: 統一されたカードデザイン
  - `btn-*`: ボタンバリアント
  - `input-*`: フォーム要素スタイル
  - `heading-*`: タイポグラフィ階層

### 環境変数設定

`.env.example`に基づく必要な環境変数：

```bash
# 必須: フォーム送信用
PUBLIC_CONTACT_FORM_ENDPOINT=https://ssgform.com/s/xxxxx

# オプション: Qiita統合用
QIITA_API_ENDPOINT=https://qiita.com/api/v2
QIITA_USERNAME=USER_NAME

# オプション: Zenn統合用
ZENN_API_ENDPOINT=https://zenn.dev/api
ZENN_USERNAME=saku2323

# オプション: アナリティクス用
PUBLIC_GOOGLE_ANALYTICS_ID=GA_TRACKING_ID
PUBLIC_GOOGLE_RECAPTCHA_SITE_KEY=RECAPTCHA_SITE_KEY
```

**重要**: クライアントサイドで使用する変数には`PUBLIC_`プレフィックスが必要

### 設定ファイル

- `astro.config.mjs` - SSGモード、インテグレーション設定
- `uno.config.ts` - カスタムショートカット、アイコン設定
- `tsconfig.json` - パスマッピング（`@/*` → `./src/*`）
- `.eslintrc.cjs` - Astro/React/TypeScript用のルール設定

### デプロイメント

- **現在**: Cloudflare Pages（静的サイト）
- **将来対応**: SSR準備済み（astro.config.mjsでコメントアウト）
- **ビルドプロセス**:
  1. `npm run build` - 基本ビルド
  2. `npm run build:with-ogp` - OGP画像付きビルド（推奨）

### 開発時の注意点

- OGP画像生成前に`npm run dev`でローカルサーバーを起動
- コンポーネント作成時はAstro（静的）かReact（動的）かを判断
- 新しいブログ記事追加時はOGP画像も自動生成される
- フォーム機能テスト時は実際のSSGFormエンドポイントが必要
