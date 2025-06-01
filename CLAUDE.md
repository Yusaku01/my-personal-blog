# CLAUDE.md

このファイルは、このリポジトリでコードを扱う際のClaude Code（claude.ai/code）への指針を提供します。

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
npm run format       # 全ファイルのフォーマットxっぃ
npm run format:check # 変更なしでフォーマットチェック
```

## アーキテクチャ概要

このプロジェクトはAstroベースの個人ブログで、以下の技術を使用しています：

- **Astro v5.6.0** - 静的サイト生成
- **React v18** - インタラクティブコンポーネント（.tsxファイル）
- **UnoCSS** - スタイリング（Tailwind互換のアトミックCSS）
- **MDX** - コンポーネントサポート付きブログコンテンツ
- **TypeScript** - 型安全性

### 主要ディレクトリ

- `src/pages/` - ファイルベースルーティング（Astroページ）
- `src/components/` - 再利用可能なUIコンポーネント（Astro/React）
- `src/content/blog/` - MDX形式のブログ記事
- `src/lib/api-clients/` - 外部API統合（Qiita、お問い合わせフォーム）
- `public/` - 直接配信される静的アセット

### 重要なパターン

1. **コンポーネント構成**: 機能別にグループ化（Blog/、Contact/など）
2. **スタイリング**: `uno.config.ts`で定義されたカスタムショートカット付きUnoCSS
3. **コンテンツコレクション**: Zodスキーマ検証を使用したAstroのコンテンツコレクション
4. **APIルート**: `pages/api/og/[...slug].astro`経由での動的OGP画像生成
5. **パスエイリアス**: インポートで`@/*`は`./src/*`にマップ

### 設定ファイル

- `astro.config.mjs` - インテグレーションを含むAstro設定
- `uno.config.ts` - カスタムショートカット付きUnoCSS設定
- `tsconfig.json` - TypeScript設定
- `.eslintrc.cjs` - JS/TS/Astro/Reactファイル用のESLintルール

### 備考

- 現在、テストフレームワークは設定されていません
- サイトはCloudflare Pagesにデプロイされます
- テーマ切り替えによるダークモードをサポート
- フォームはZod検証付きReact Hook Formを使用
- OGP画像はビルドプロセスでPuppeteerを使用して生成されます
