# Repository Guidelines

Astro・MDX・TypeScript で構築された個人ブログ / ポートフォリオ。リポジトリ全体に適用する指針として、既存のコンテンツ運用と表示体験を保ち、依頼の目的に必要な変更を行う。

## 作業範囲と完了条件

- 着手時に `git status --short --branch` で作業場所・ブランチ・差分を確認し、既存の変更を保持する。関係ないファイルの整形や文言変更は含めない。
- 会話から依頼の目的と範囲を判断する。調査・レビューの依頼は根拠を伴う説明まで、実装・修正の依頼は変更・必要な検証・その変更に起因する不具合の修正まで完了する。実装依頼を計画の提示だけで終えない。
- 通常の実装判断は自分で行い、結果を左右する不足情報だけを質問する。回答待ちでも独立して進められる作業は続け、すでに認められた作業について再確認しない。
- 途中の補足・訂正を取り込み、元の目的と完了した作業を維持する。明示的な中止や目的変更がなければ、途中の質問に答えた後も作業を続ける。
- コミット、push、PR 作成・更新、merge、deploy は会話で依頼された範囲で行う。実装の依頼だけから公開操作の許可を推定しない。追加の承認が必要な場合も、承認済みの範囲で結果をレビューできる状態まで準備する。
- 日本語で結果を先に、変更理由・検証結果・残る制約を簡潔に伝える。実測・推測・未確認を区別し、短い段落を基本に、列挙や比較が必要な箇所だけ箇条書きや表を使う。

## 実装とコンテンツの方針

- 変更対象の実装・設定・スクリプトを確認する。バージョンやコマンドなどの事実は実ファイルを正とし、関連資料は作業に必要なものだけ読む。
- 依存パッケージの追加・更新時は、`package.json` と `pnpm-workspace.yaml` の override 値を exact pin にし、lockfile を更新する。キャレットなどのバージョン範囲指定を残さない。
- ルーティングは `src/pages/`、UI は `src/components/` と `src/layouts/`、ドメインロジックは `src/lib/` に置く。検索・問い合わせ・外部フィードは既存実装を再利用する。`@/*` は `src/*` のエイリアス。
- 静的な UI は Astro コンポーネントを優先する。クライアントの振る舞いは `src/scripts/` の既存パターンを確認し、hydration が必要な場合は遅延実行を検討する。
- UnoCSS から CSS Variables と scoped CSS へ段階的に移行する。共有トークン・Markdown 共通スタイルは `src/styles/global.css`、固有のスタイルは各 `.astro` に置く。置換は小さなコンポーネント単位とし、新しい UnoCSS 依存を広げない。
- 記事・プロフィールは `src/content/` に置き、frontmatter を `src/content.config.ts` の schema に合わせる。記事ファイル名は kebab-case とし、既存の Markdown / MDX 記法、脚注、装飾を踏襲する。
- Markdown / MDX の変換を変更する場合は `src/lib/markdown/`、`src/lib/remark/`、`src/lib/rehype/` の既存ルールに合わせる。
- Cloudflare adapter と `output: 'server'` を使用する。ページごとの事前生成は `prerender` を確認する。問い合わせは `src/pages/contact.astro` の `prerender = false` を保ち、`src/lib/contact/` の Turnstile 検証・D1 保存・Email 通知の境界を維持する。
- 整形・lint は `.prettierrc` と `eslint.config.mjs` に従う。コンポーネントは `PascalCase`、関数は `camelCase`、環境変数は `SCREAMING_SNAKE_CASE`。`any` は避け、未使用変数は `_` プレフィックスを使う。
- シークレットはコミットしない。環境変数は `.env` と `.env.example` で管理し、クライアントに公開する値にだけ `PUBLIC_` プレフィックスを付ける。

## 検証

変更の影響に応じて確認を選び、成功後の繰り返しや範囲拡大は、新しい差分・失敗・未解決の懸念がある場合に行う。CI・Git hooks の必須チェックは省略しない。

| 変更内容         | 確認内容                                                                                   |
| ---------------- | ------------------------------------------------------------------------------------------ |
| 文書・文言のみ   | 対象の整形・リンク。ブログ記事は必要なテキスト lint。全体ビルド・テストは通常不要          |
| コード・ロジック | 関連する既存テストを確認し、影響に応じて lint・Astro check・テストを実行                   |
| UI・記事表示     | ローカルの対象ページで表示を目視確認。ビルド後の確認は `pnpm run preview` を使う           |
| OGP・Mermaid     | 生成結果を目視確認。Mermaid 用ブラウザが必要なら `pnpm run mermaid:install-browser` を使う |

文書・文言のみの変更や、低影響で容易に戻せる変更に、実装をなぞるだけのテストを追加しない。確認できない項目は理由と影響を報告し、未実施の確認を成功として扱わない。

主なコマンドは以下を使う。その他のコマンドと実行内容は `package.json` を参照する。

| 用途                       | コマンド                                                      |
| -------------------------- | ------------------------------------------------------------- |
| 開発 / ビルド / プレビュー | `pnpm run dev` / `pnpm run build` / `pnpm run preview`        |
| lint / 型・コンテンツ検査  | `pnpm run lint` / `pnpm run astro check`                      |
| テスト一括 / Node / Vitest | `pnpm run test` / `pnpm run test:node` / `pnpm run test:unit` |
| 対象ファイルの整形確認     | `pnpm exec prettier --check <対象ファイル>`                   |
| ブログのテキスト lint      | `pnpm run lint:text:blog -- <対象記事>`                       |
| OGP 生成 / OGP 付きビルド  | `pnpm run generate-ogp` / `pnpm run build:with-ogp`           |
| Cloudflare 向けビルド      | `pnpm run build:cloudflare`                                   |

## 作業別の参照先と Skills

ユーザーの明示的な指示を Skills のガイドラインより優先する。必要な Skill だけを使い、推奨手順を新たな承認条件にしない。指示を理由に確認・停止・依頼からの逸脱が必要になった場合は、該当ファイルへのリンクと原文を示し、明示された要件と自分の解釈を区別して説明する。

| 作業                                                       | 参照先                                                                                                                                       |
| ---------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| Node・pnpm・チェック手順の確認                             | `mise.toml`、`package.json`、`.github/workflows/`                                                                                            |
| ビルド・配信設定の変更                                     | `astro.config.mjs`、`wrangler.jsonc`                                                                                                         |
| 環境変数・問い合わせ binding の変更                        | `.env.example`、`src/lib/contact/types.ts`                                                                                                   |
| OGP 生成の変更                                             | `scripts/build-ogp.js`、`scripts/lib/build-ogp-core.js`                                                                                      |
| Web API・CSS・アクセシビリティ・性能・ブラウザ互換性の判断 | [.agents/skills/modern-web-guidance/SKILL.md](.agents/skills/modern-web-guidance/SKILL.md)                                                   |
| Nani を指定した翻訳レビュー                                | [.agents/skills/nani-translation-review/SKILL.md](.agents/skills/nani-translation-review/SKILL.md)                                           |
| 依存脆弱性の調査・修正                                     | [.github/dependency-security-triage.md](.github/dependency-security-triage.md) を先に読む                                                    |
| Incremental Build の変更                                   | [関連資料](docs/blog-materials/astro-incremental-static-build/README.md)と実装を確認し、キャッシュの出力依存と通常・強制ビルドの差を検証する |

## コミットと PR

- コミットは Conventional Commits に従い、英語で簡潔に書く。1 コミットは 1 つの目的とし、コンテンツ大量更新とコード変更は分ける。
- PR には要約・変更点・確認内容・関連 Issue を記載する。UI・OGP の変更にはスクリーンショットを添える。

## この指針の保守

2026-09-19 に以下の公式資料を参照して整理。常時必要な判断基準とリポジトリ固有の方針を残し、設定値や詳細手順は実装・設定・関連資料を参照する。モデル選択・推論設定はこのファイルでは変更しない。

- [GPT-6 Astra: Prompting best practices](https://developers.openai.com/api/docs/guides/latest-model?model=gpt-6-astra#prompting-best-practices)
- [Rethinking skills and prompts for GPT-6 Astra](https://developers.openai.com/blog/rethinking-skills-and-prompts-for-gpt-6-astra)
