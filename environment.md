# プロジェクト環境構成

*このファイルは自動的に生成・更新されます*

## 📁 ディレクトリ構造

```text
.
├── public
│   ├── images
│   │   ├── astro-tutorial.jpg
│   │   ├── icon_github-dark.svg
│   │   ├── icon_github-light.svg
│   │   ├── icon_linkedin.svg
│   │   ├── icon_qiita.png
│   │   ├── icon_x-dark.svg
│   │   ├── icon_x-light.svg
│   │   └── img_profile.png
│   ├── ogp
│   │   ├── blog.png
│   │   ├── contact.png
│   │   ├── default.png
│   │   ├── getting-started-blog.png
│   │   └── profile.png
│   └── favicon.svg
├── src
│   ├── components
│   │   ├── Blog
│   │   ├── Contact
│   │   ├── Breadcrumb.astro
│   │   ├── Footer.astro
│   │   ├── Header.astro
│   │   ├── HeroSection.astro
│   │   ├── ProfileSection.astro
│   │   ├── SectionHeading.astro
│   │   ├── TableOfContents.astro
│   │   ├── ThemeToggle.astro
│   │   └── ViewToggle.tsx
│   ├── content
│   │   ├── blog
│   │   └── config.ts
│   ├── layouts
│   │   └── Layout.astro
│   ├── lib
│   │   ├── api-clients
│   │   └── utils
│   ├── pages
│   │   ├── api
│   │   ├── blog
│   │   ├── contact.astro
│   │   ├── index.astro
│   │   └── profile.astro
│   ├── styles
│   │   └── unoVariants.ts
│   ├── types
│   │   └── index.ts
│   └── env.d.ts
├── README.md
├── astro.config.mjs
├── environment.md
├── package-lock.json
├── package.json
├── tsconfig.json
└── uno.config.ts

19 directories, 38 files

```

## 🔑 主要ファイルの役割

### 設定ファイル
- `astro.config.mjs`: Astroの設定（プラグイン、統合など）
- `uno.config.ts`: UnoCSSの設定と拡張
- `tsconfig.json`: TypeScriptのコンパイラ設定

### コアコンポーネント
- `src/layouts/Layout.astro`: 全ページで使用される基本レイアウト（OGP対応含む）
- `src/components/Header.astro`: サイトヘッダー（ナビゲーション）
- `src/components/Footer.astro`: サイトフッター

### ページコンポーネント
- `src/pages/index.astro`: トップページ
- `src/pages/blog/index.astro`: ブログ一覧ページ
- `src/pages/blog/[slug].astro`: 個別ブログ記事ページ
- `src/pages/profile.astro`: プロフィールページ
- `src/pages/contact.astro`: お問い合わせページ
- `src/pages/api/og/[...slug].astro`: 動的OGP画像生成エンドポイント

### スタイル
- `src/styles/unoVariants.ts`: UnoCSSのカスタム変数・バリアント定義
- UnoCSSを使用したユーティリティファーストなスタイリング

### ユーティリティ
- `scripts/build-ogp.js`: Puppeteerを使用したOGP画像生成スクリプト
- `src/content/config.ts`: コンテンツコレクション定義

### 静的アセット
- `public/ogp/`: 動的生成されたOGP画像
- `public/images/`: サイトで使用される画像素材

## 🔄 自動更新の仕組み

このファイルは以下のタイミングで自動的に更新されます：

1. 新しいコンポーネントの追加時
2. ディレクトリ構造の変更時
3. 主要な設定ファイルの変更時

更新は`npm run dev`実行時に自動的にチェックされます。
