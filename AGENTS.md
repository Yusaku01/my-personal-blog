# Repository Guidelines

このリポジトリは Astro 7 で構築された個人ブログ / ポートフォリオです。変更は小さく保ち、既存のコンテンツ運用と表示体験を崩さないことを優先してください。

## 作業の進め方

- 着手時に `git status --short --branch` で作業場所と差分を確認し、既存の変更を保持する。
- 調査依頼は調査と説明まで。実装・修正の依頼は、通常の実装判断を自分で行い、必要な検証まで完了する。すでに認められた作業について再確認しない。
- 結果を左右する不足情報だけを質問する。回答待ちでも独立して進められる作業は続ける。
- ユーザーの明示的な指示を Skills のガイドラインより優先する。Skills は依頼に必要なものだけ読み、推奨手順を新たな承認条件にしない。指示が原因で停止する場合は、該当ファイルと原文、停止理由を示す。
- 途中の補足・訂正を取り込み、完了した作業と元の目的を維持する。
- コミット、push、PR、merge、deploy は会話で依頼された範囲で行う。実装の依頼だけから公開操作の許可を推定しない。
- 検証は変更の影響に合わせる。必要な確認が通った後は、新たな差分・失敗・未解決の懸念がない限り繰り返さない。文書・文言だけの変更に実装をなぞるテストを追加しない。
- 日本語で結果を先に、変更理由・検証結果・残る制約を簡潔に伝える。実測、推測、未確認を区別する。

## Architecture Overview

- Core: Astro 7、MDX、TypeScript
- Styling: 既存のUnoCSS（`uno.config.ts`）を段階的にCSS Variables（`src/styles/global.css`）と
  Astroコンポーネント内のscoped CSSへ移行中
- Deployment: `astro.config.mjs` は `output: 'server'`、Cloudflare adapter 有効。Workers と Static Assets の設定は `wrangler.jsonc`、各ページの事前生成は `prerender` を確認する
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
- Cloudflare 向けビルド: `pnpm run build:cloudflare`
- Mermaid 用ブラウザ導入: `pnpm run mermaid:install-browser`

## Coding Style & Naming Conventions

- Prettier: 2-space, semicolons, single quotes, trailing commas, print width 100
- ESLint: TypeScript / Astro を対象。`any` は避け、未使用変数は `_` プレフィックスを使う
- 命名: Components は PascalCase、functions は camelCase、環境変数は SCREAMING_SNAKE_CASE
- ブログ記事ファイル名: `src/content/blog/` 配下で kebab-case
- 既存の Markdown / MDX 記法、脚注、装飾ルールに合わせる

## Testing Guidelines

- コード変更時は、影響範囲に応じて `pnpm run lint`、`pnpm run astro check`、`pnpm run test` を基本確認とする
- 特定機能の変更は関連する既存テストを確認する。文書・文言のみなら対象の整形・リンク・必要なテキスト lint を確認し、全体ビルドやテストは通常不要。ただし CI・Git hooks の必須チェックは省略しない
- UI、記事表示、OGP に関わる変更では `pnpm run preview` での目視確認を行う
- OGP や Mermaid 表示を変更した場合は、必要に応じて `pnpm run mermaid:install-browser` 実行後に生成結果を確認する

## Commit & Pull Request Guidelines

- Conventional Commits を使う
- 例: `feat: add blog search keyboard support`, `fix: handle missing contact env`
- PR には要約、変更点、確認内容、関連 Issue を含める
- UI 変更や OGP 変更ではスクリーンショットを添える
- コンテンツ大量更新とコード変更は、できるだけ分けてレビューしやすくする

## Skills と関連資料

- `.agents/skills/modern-web-guidance/SKILL.md`: Web API・CSS・ブラウザ互換性の判断が必要な変更で使う。
- `.agents/skills/nani-translation-review/SKILL.md`: Nani を使う翻訳レビューで使う。通常の日本語記事修正には適用しない。
- 依存脆弱性の調査・修正では `.github/dependency-security-triage.md` を先に読む。
- Incremental Build の変更では `docs/blog-materials/astro-incremental-static-build/README.md` と実装を確認する。キャッシュに関わる出力依存と通常ビルド・強制ビルドの差を確認する。

## Security & Configuration Tips

- シークレットはコミットしない。`.env` と `.env.example` を使う
- クライアント公開変数は `PUBLIC_` プレフィックスを付ける
- 外部フィード系: `QIITA_USERNAME`, `ZENN_USERNAME`
- 外部フィード API: `QIITA_API_ENDPOINT`, `ZENN_API_ENDPOINT`
- 問い合わせ関連: `EMAIL` binding、`CONTACT_TO_EMAIL`, `CONTACT_FROM_EMAIL`, `TURNSTILE_SECRET_KEY`, `PUBLIC_TURNSTILE_SITE_KEY`。実際の契約は `src/lib/contact/types.ts` を確認する
- 問い合わせ保存を使う場合の実行環境: `CONTACT_DB`
- 分析: `PUBLIC_GOOGLE_ANALYTICS_ID`
- Node と pnpm の実行環境は現在のバージョン管理ファイルと CI 設定を確認する。古い固定バージョンをこの文書から推定しない

## Dev Tips for Agents

- 静的な UI は Astro コンポーネントを優先する
- 新規・変更するUIのスタイルは、共有トークンやグローバルなMarkdownスタイルを
  `src/styles/global.css` に置き、コンポーネント固有の見た目は各 `.astro` のscoped CSSを優先する
- 既存UnoCSSの置換は小さなコンポーネント単位で行い、移行中でない箇所へ新しいUnoCSS依存を広げない
- クライアント側の振る舞いは、まず `src/scripts/` の既存パターンで足せるか検討する
- hydration が必要な場合でも、常時実行より遅延実行を優先する
- Markdown / MDX の変換処理は `src/lib/markdown/` と `src/lib/remark/`, `src/lib/rehype/` を確認して既存ルールに合わせる
- 検索、問い合わせ、外部フィードは `src/lib/` 配下の既存実装を再利用し、重複ロジックを増やさない
- 問い合わせ機能は `src/lib/contact/` に集約されており、Cloudflare Email binding、Turnstile 検証、D1 repository を前提にしている
- OGP 生成前はローカルサーバーが必要なので、必要に応じて別ターミナルで `pnpm run dev` を起動する

## Agent-Specific Instructions

- 変更前に実ファイルとスクリプトを確認し、ガイド文面より実装を優先して判断する
- 既存の内容記事やプロフィールデータを編集する場合は、frontmatter / schema 整合を崩さない
- 問い合わせは `src/pages/contact.astro` に存在し、`prerender = false`。実行時の binding と検証・保存・通知の境界を保つ
- 関係ないファイルの整形や大規模な文言変更は避ける
- このファイルの指示は、リポジトリ配下で編集するすべてのファイルに適用する

## 指示の保守

2026-09-05 に [GPT-6 Astra の公式ガイド](https://developers.openai.com/api/docs/guides/latest-model?model=gpt-6-astra) を参照して調整。
モデル選択・推論設定はこのファイルでは変更しない。バージョンやコマンドは実ファイルを確認する。
