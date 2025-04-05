# プロジェクト環境構成

_このファイルは自動的に生成・更新されます_

## 📁 ディレクトリ構造

```text
.
├── public
│   ├── images
│   │   ├── blog
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
│   │   ├── getting-started-blog2.png
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

20 directories, 38 files

```

## 🔑 主要ファイルの役割

### 設定ファイル

- `astro.config.mjs`: Astroの設定（プラグイン、統合など）
- `tailwind.config.mjs`: Tailwind CSSのカスタマイズ設定
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
