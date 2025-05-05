# プロジェクト環境構成

*このファイルは自動的に生成・更新されます*

## 📁 ディレクトリ構造

```text
.
├── docs
│   └── lighthouse
│       └── lh_20250419.html
├── public
│   ├── images
│   │   ├── blog
│   │   ├── icon_github-dark.svg
│   │   ├── icon_github-light.svg
│   │   ├── icon_linkedin.svg
│   │   ├── icon_qiita.png
│   │   ├── icon_x-dark.svg
│   │   └── icon_x-light.svg
│   ├── ogp
│   │   ├── blog.png
│   │   ├── contact.png
│   │   ├── default.png
│   │   ├── getting-started-blog.png
│   │   └── profile.png
│   ├── apple-touch-icon.png
│   ├── favicon.ico
│   └── favicon.svg
├── src
│   ├── assets
│   │   └── img
│   ├── components
│   │   ├── Blog
│   │   ├── Breadcrump
│   │   ├── Contact
│   │   ├── Footer
│   │   ├── Header
│   │   ├── Hero
│   │   ├── Profile
│   │   ├── Section
│   │   ├── Theme
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
│   │   ├── profile.astro
│   │   └── rss.xml.ts
│   ├── styles
│   │   └── unoVariants.ts
│   ├── types
│   │   └── index.ts
│   └── env.d.ts
├── astro.config.mjs
├── environment.md
├── package-lock.json
├── package.json
├── README.md
├── todo.md
├── tsconfig.json
└── uno.config.ts

31 directories, 33 files

```

## 🔑 主要ファイルの役割

### 設定ファイル
- `astro.config.mjs`: Astroの設定（プラグイン、統合など）
- `tsconfig.json`: TypeScriptのコンパイラ設定

### コアコンポーネント
- `src/layouts/Layout.astro`: 全ページで使用される基本レイアウト
- `src/components/Header.astro`: サイトヘッダー（ナビゲーション）
- `src/components/Footer.astro`: サイトフッター

### ページコンポーネント

### スタイル

### ユーティリティ


## 🔄 自動更新の仕組み

このファイルは以下のタイミングで自動的に更新されます：

1. 新しいコンポーネントの追加時
2. ディレクトリ構造の変更時
3. 主要な設定ファイルの変更時

更新は`npm run dev`実行時に自動的にチェックされます。
