# プロジェクト環境構成

*このファイルは自動的に生成・更新されます*

## 📁 ディレクトリ構造

```text
.github/
  ISSUE_TEMPLATE/
    bug_report.md
    feature_request.md
  workflows/
    claude-code-review.yml
    claude.yml
    github_workflows_claude-issue-triage.yml
  pull_request_template.md
.vscode/
  extensions.json
  launch.json
.windsurf/
  rules/
    architecture.md
    basical-rules.md
    coding-style.md
    commit-message.md
    design-guidelines.md
    operation.md
    security.md
    testing.md
public/
  images/
    blog/
    icon_github-dark.svg
    icon_github-light.svg
    icon_linkedin.svg
    icon_qiita.png
    icon_rss-dark.svg
    icon_rss-light.svg
    icon_x-dark.svg
    icon_x-light.svg
  ogp/
    blog.png
    contact.png
    default.png
    getting-started-blog.png
    profile.png
  _headers
  apple-touch-icon.png
  favicon.ico
  favicon.svg
src/
  assets/
    img/
  content/
    blog/
    config.ts
  features/
    blog/
    contact/
    profile/
  pages/
    api/
    blog/
    contact.astro
    index.astro
    profile.astro
    rss.xml.ts
  shared/
    components/
    layouts/
  styles/
    unoVariants.ts
  types/
    index.ts
  env.d.ts
.env.example
.eslintrc.cjs
.gitignore
.prettierignore
.prettierrc
AGENTS.md
astro.config.mjs
CLAUDE.md
environment.md
package-lock.json
package.json
README.md
todo.md
tsconfig.json
uno.config.ts
```

## 🔑 主要ファイルの役割

### 設定ファイル
- `astro.config.mjs`: Astroの設定（プラグイン、統合など）
- `tsconfig.json`: TypeScriptのコンパイラ設定

### コアコンポーネント
- `src/shared/layouts/Layout.astro`: 全ページで使用される基本レイアウト
- `src/shared/components/header/Header.astro`: サイトヘッダー（ナビゲーション）
- `src/shared/components/footer/Footer.astro`: サイトフッター

### ページコンポーネント
- `src/pages/index.astro`: トップページの Astro エントリポイント
- `src/pages/blog/index.astro`: ブログ一覧ページ
- `src/pages/blog/[...slug].astro`: ブログ詳細ページ
- `src/pages/profile.astro`: プロフィールページ
- `src/pages/contact.astro`: お問い合わせページ

### スタイル

### ユーティリティ
- `src/features/blog/api/`: ブログ機能で利用する外部記事の取得API
- `src/features/blog/utils/`: ブログ向けの共通ユーティリティ
- `src/features/contact/api/`: お問い合わせフォーム送信ロジック


## 🔄 自動更新の仕組み

このファイルは以下のタイミングで自動的に更新されます：

1. 新しいコンポーネントの追加時
2. ディレクトリ構造の変更時
3. 主要な設定ファイルの変更時

更新は`npm run dev`実行時に自動的にチェックされます。
