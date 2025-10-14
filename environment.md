# プロジェクト環境構成

_このファイルは自動的に生成・更新されます_

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
│   │   ├── icon_rss-dark.svg
│   │   ├── icon_rss-light.svg
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
│   ├── content
│   │   ├── blog
│   │   └── config.ts
│   ├── features
│   │   ├── blog
│   │   │   ├── api
│   │   │   │   ├── qiita.ts
│   │   │   │   └── zenn.ts
│   │   │   └── components
│   │   │       ├── BlogControls.tsx
│   │   │       ├── PostCard.tsx
│   │   │       ├── ShareButtons.astro
│   │   │       ├── TableOfContents.astro
│   │   │       └── index.ts
│   │   ├── contact
│   │   │   ├── api
│   │   │   │   └── submitContactForm.ts
│   │   │   └── components
│   │   │       ├── ContactForm.tsx
│   │   │       ├── ContactFormInput.tsx
│   │   │       ├── ContactFormLabel.tsx
│   │   │       ├── ContactFormTextarea.tsx
│   │   │       └── SuspenseContactForm.tsx
│   │   ├── layout
│   │   │   ├── components
│   │   │   │   ├── Breadcrumb
│   │   │   │   │   └── Breadcrumb.astro
│   │   │   │   ├── Footer
│   │   │   │   │   └── Footer.astro
│   │   │   │   ├── Header
│   │   │   │   │   └── Header.astro
│   │   │   │   ├── SocialIcons.astro
│   │   │   │   └── Theme
│   │   │   │       └── ThemeToggle.astro
│   │   │   └── layouts
│   │   │       └── SiteLayout.astro
│   │   ├── profile
│   │   │   ├── components
│   │   │   │   └── Profile
│   │   │   │       └── ProfileSection.astro
│   │   │   └── constants
│   │   │       └── profileContent.ts
│   │   └── shared
│   │       └── components
│   │           ├── Hero
│   │           │   └── HeroSection.astro
│   │           ├── Section
│   │           │   └── SectionHeading.astro
│   │           └── ViewToggle.tsx
│   ├── lib
│   │   └── utils
│   │       └── ogp.ts
│   ├── pages
│   │   ├── api
│   │   │   └── og
│   │   │       └── [...slug].astro
│   │   ├── blog
│   │   │   ├── [...slug].astro
│   │   │   ├── [...slug].md.ts
│   │   │   └── index.astro
│   │   ├── contact.astro
│   │   ├── index.astro
│   │   ├── profile.astro
│   │   └── rss.xml.ts
│   ├── styles
│   │   └── unoVariants.ts
│   ├── types
│   │   └── index.ts
│   └── env.d.ts
├── AGENTS.md
├── astro.config.mjs
├── CLAUDE.md
├── environment.md
├── package-lock.json
├── package.json
├── README.md
├── todo.md
├── tsconfig.json
└── uno.config.ts

33 directories, 40 files

```

## 🔑 主要ファイルの役割

### 設定ファイル

- `astro.config.mjs`: Astroの設定（プラグイン、統合など）
- `tsconfig.json`: TypeScriptのコンパイラ設定

### コアコンポーネント

- `src/features/layout/layouts/SiteLayout.astro`: 全ページで使用される基本レイアウト
- `src/features/layout/components/Header/Header.astro`: サイトヘッダー（ナビゲーション）
- `src/features/layout/components/Footer/Footer.astro`: サイトフッター

### ページコンポーネント

### スタイル

### ユーティリティ

## 🔄 自動更新の仕組み

このファイルは以下のタイミングで自動的に更新されます：

1. 新しいコンポーネントの追加時
2. ディレクトリ構造の変更時
3. 主要な設定ファイルの変更時

更新は`npm run dev`実行時に自動的にチェックされます。
