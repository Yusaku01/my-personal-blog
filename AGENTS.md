# Repository Guidelines

このリポジトリは Astro 6 で構築された個人ブログ / ポートフォリオです。変更は小さく保ち、既存のコンテンツ運用と表示体験を崩さないことを優先してください。

## Architecture Overview

- Core: Astro 6、MDX、TypeScript
- Styling: UnoCSS (`uno.config.ts`)
- Deployment: `output: 'static'` の静的サイト。Cloudflare Pages 運用を前提に `build:cloudflare` を用意しているが、現状 `astro.config.ts` で Cloudflare adapter は有効化していない
- Routing: `src/pages/` 配下のファイルベースルーティング
- Aliases: TypeScript path alias `@/*` → `./src/*` (`tsconfig.json`)
- Content collections: `src/content.config.ts` で `blog` / `findsFeed` / `profile` を定義

## Project Structure & Module Organization

- アプリ本体: `src/`
- UI: `src/components/`, `src/layouts/`
- ドメインロジック: `src/lib/`
- ルーティング: `src/pages/`
- コンテンツ: `src/content/blog/`, `src/content/findsFeed/`, `src/content/profile/`
- スクリプト: `scripts/build-ogp.js`, `scripts/perf/measure-fonts.mjs`
- テスト: `tests/`
- 静的アセット: `public/`
- ビルド成果物: `dist/`
- ドキュメント: `docs/`

`blog` コレクションの frontmatter は `src/content.config.ts` の schema に合わせます。

```yaml
title: 'Post Title'
description: 'Summary'
publishDate: 2025-01-01
author: 'Your Name'
image: '../../assets/images/blog/common/image_thumnail.png' # optional
tags: ['Astro', 'UnoCSS']
```

## Build, Test, and Development Commands

- 開発サーバー: `pnpm run dev`
- ビルド: `pnpm run build`
- プレビュー: `pnpm run preview`
- Lint: `pnpm run lint`
- Lint 自動修正: `pnpm run lint:fix`
- テキスト lint: `pnpm run lint:text`, `pnpm run lint:text:blog`, `pnpm run lint:text:blog:tech`, `pnpm run lint:text:blog:diary`
- Format: `pnpm run format`
- Format 確認: `pnpm run format:check`
- Astro の型 / コンテンツ検査: `pnpm run astro check`
- テスト一括: `pnpm run test`
- Node test runner: `pnpm run test:node`
- Vitest: `pnpm run test:unit`
- OGP 生成: `pnpm run generate-ogp`
- OGP 付きビルド: `pnpm run build:with-ogp`
- Cloudflare Pages 向けビルド: `pnpm run build:cloudflare`
- Mermaid 用ブラウザ導入: `pnpm run mermaid:install-browser`

## Coding Style & Naming Conventions

- Prettier: 2-space, semicolons, single quotes, trailing commas, print width 100
- ESLint: TypeScript / Astro を対象。`any` は避け、未使用変数は `_` プレフィックスを使う
- 命名: Components は PascalCase、functions は camelCase、環境変数は SCREAMING_SNAKE_CASE
- ブログ記事ファイル名: `src/content/blog/` 配下で kebab-case
- 既存の Markdown / MDX 記法、脚注、装飾ルールに合わせる

## Testing Guidelines

- コード変更時は、影響範囲に応じて `pnpm run lint`、`pnpm run astro check`、`pnpm run test` を基本確認とする
- 特定機能のみ触る場合でも、最低限その周辺テストは確認する
- UI、記事表示、OGP に関わる変更では `pnpm run preview` での目視確認を行う
- OGP や Mermaid 表示を変更した場合は、必要に応じて `pnpm run mermaid:install-browser` 実行後に生成結果を確認する

## Commit & Pull Request Guidelines

- Conventional Commits を使う
- 例: `feat: add blog search keyboard support`, `fix: handle missing contact env`
- PR には要約、変更点、確認内容、関連 Issue を含める
- UI 変更や OGP 変更ではスクリーンショットを添える
- コンテンツ大量更新とコード変更は、できるだけ分けてレビューしやすくする

## Security & Configuration Tips

- シークレットはコミットしない。`.env` と `.env.example` を使う
- クライアント公開変数は `PUBLIC_` プレフィックスを付ける
- 外部フィード系: `QIITA_USERNAME`, `ZENN_USERNAME`
- 外部フィード API: `QIITA_API_ENDPOINT`, `ZENN_API_ENDPOINT`
- 問い合わせ関連: `RESEND_API_KEY`, `CONTACT_TO_EMAIL`, `CONTACT_FROM_EMAIL`, `GOOGLE_RECAPTCHA_SECRET_KEY`, `PUBLIC_GOOGLE_RECAPTCHA_SITE_KEY`
- 問い合わせ保存を使う場合の実行環境: `CONTACT_DB`
- 分析: `PUBLIC_GOOGLE_ANALYTICS_ID`
- 実行環境は `package.json` の `volta.node` にある Node `22.20.0` を基準にする

## Dev Tips for Agents

- 静的な UI は Astro コンポーネントを優先する
- クライアント側の振る舞いは、まず `src/scripts/` の既存パターンで足せるか検討する
- hydration が必要な場合でも、常時実行より遅延実行を優先する
- Markdown / MDX の変換処理は `src/lib/markdown/` と `src/lib/remark/`, `src/lib/rehype/` を確認して既存ルールに合わせる
- 検索、問い合わせ、外部フィードは `src/lib/` 配下の既存実装を再利用し、重複ロジックを増やさない
- 問い合わせ機能は `src/lib/contact/` に集約されており、Resend 通知、reCAPTCHA 検証、D1 repository を前提にしている
- OGP 生成前はローカルサーバーが必要なので、必要に応じて別ターミナルで `pnpm run dev` を起動する

## Agent-Specific Instructions

- 変更前に実ファイルとスクリプトを確認し、ガイド文面より実装を優先して判断する
- 既存の内容記事やプロフィールデータを編集する場合は、frontmatter / schema 整合を崩さない
- `src/pages/contact.astro` は現時点で存在しないため、問い合わせ導線やページ追加は実装有無を確認してから扱う
- 関係ないファイルの整形や大規模な文言変更は避ける
- このファイルの指示は、リポジトリ配下で編集するすべてのファイルに適用する
