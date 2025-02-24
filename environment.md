# プロジェクト環境構成

*このファイルは自動的に生成・更新されます*

## 📁 ディレクトリ構造

```text
.
├── public
│   └── favicon.svg
├── src
│   ├── assets
│   │   ├── astro.svg
│   │   └── background.svg
│   ├── components
│   │   ├── Blog
│   │   ├── Contact
│   │   ├── ui
│   │   ├── Footer.astro
│   │   ├── Header.astro
│   │   ├── HeroSection.astro
│   │   ├── ProfileSection.astro
│   │   ├── SectionHeading.astro
│   │   ├── TableOfContents.astro
│   │   └── ViewToggle.tsx
│   ├── content
│   │   ├── blog
│   │   └── config.ts
│   ├── layouts
│   │   └── Layout.astro
│   ├── lib
│   │   ├── api-clients
│   │   ├── styles
│   │   └── utils
│   ├── pages
│   │   ├── blog
│   │   ├── contact.astro
│   │   ├── index.astro
│   │   └── profile.astro
│   ├── styles
│   │   ├── post-card.css
│   │   └── variants.ts
│   ├── types
│   │   └── index.ts
│   └── env.d.ts
├── README.md
├── astro.config.mjs
├── environment.md
├── package-lock.json
├── package.json
├── tailwind.config.mjs
└── tsconfig.json

19 directories, 26 files

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
