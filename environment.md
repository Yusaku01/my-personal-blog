# プロジェクト環境構成

*このファイルは自動的に生成・更新されます*

## 📁 ディレクトリ構造

```text
.
├── docs
│   ├── perf
│   │   └── astro6-fonts
│   ├── astro-component-structure.md
│   ├── blog-search-contact-improvement-plan.md
│   ├── blog-search-test-cases.md
│   ├── contact-submissions-schema.sql
│   ├── contact-test-cases.md
│   ├── fluid-layout-hybrid-implementation-summary.md
│   ├── fluid-typography-implementation-summary.md
│   ├── kuroco-membership-favorite-history-feasibility.md
│   ├── public-release-checklist.md
│   ├── react-to-astro-blog-components.md
│   ├── report.md
│   └── test.md
├── public
│   ├── images
│   │   ├── blog
│   │   ├── ogp
│   │   ├── icon_github-dark.svg
│   │   ├── icon_github-light.svg
│   │   ├── icon_linkedin.svg
│   │   ├── icon_qiita.png
│   │   ├── icon_rss-dark.svg
│   │   ├── icon_rss-light.svg
│   │   ├── icon_x-dark.svg
│   │   ├── icon_x-light.svg
│   │   ├── icon_zenn-dark.svg
│   │   └── icon_zenn-light.svg
│   ├── _headers
│   ├── apple-touch-icon.png
│   ├── favicon.ico
│   └── favicon.svg
├── src
│   ├── actions
│   │   └── index.ts
│   ├── assets
│   │   └── img
│   ├── components
│   │   ├── Blog
│   │   ├── Breadcrump
│   │   ├── Footer
│   │   ├── Header
│   │   ├── Hero
│   │   ├── Profile
│   │   ├── Section
│   │   ├── Sns
│   │   └── Theme
│   ├── content
│   │   ├── blog
│   │   ├── findsFeed
│   │   └── profile
│   ├── layouts
│   │   └── Layout.astro
│   ├── lib
│   │   ├── api-clients
│   │   ├── blog
│   │   ├── contact
│   │   ├── markdown
│   │   ├── rehype
│   │   ├── remark
│   │   └── utils
│   ├── pages
│   │   ├── blog
│   │   ├── 404.astro
│   │   ├── contact.astro
│   │   ├── finds.astro
│   │   ├── index.astro
│   │   ├── profile.astro
│   │   ├── rss.xml.ts
│   │   └── search-index.json.ts
│   ├── styles
│   │   └── unoVariants.ts
│   ├── types
│   │   └── index.ts
│   ├── content.config.ts
│   └── env.d.ts
├── tests
│   ├── blog-search-controller.test.ts
│   ├── blog-search-history.test.ts
│   ├── blog-search-index.test.ts
│   ├── blog-search-layout.test.ts
│   ├── blog-search.test.ts
│   ├── contact-action.test.ts
│   ├── contact-form-enhancements.test.ts
│   ├── contact-service.test.ts
│   ├── markdown-plugin-pipeline.test.mjs
│   ├── mermaid-config.test.ts
│   ├── remark-admonition.test.mjs
│   ├── remark-code-filename.test.mjs
│   ├── remark-link-card-url-candidate.test.mjs
│   └── remark-list-link-card-guard.test.mjs
├── AGENTS.md
├── astro.config.mjs
├── CLAUDE.md
├── environment.md
├── eslint.config.mjs
├── package.json
├── pnpm-lock.yaml
├── pnpm-workspace.yaml
├── README.md
├── todo.md
├── tsconfig.json
├── uno.config.ts
└── vitest.config.ts

40 directories, 66 files

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

更新は`pnpm run dev`実行時に自動的にチェックされます。
