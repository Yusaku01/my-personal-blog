# Personal Blog & Portfolio

Astro・MDX・TypeScript で構築した個人ブログ / ポートフォリオです。日本語・英語の 2 言語で記事とプロフィールを公開しています。Cloudflare Workers（`@astrojs/cloudflare`、`output: 'server'`）にデプロイしています。

## 特徴

- 日本語 / 英語のブログ記事（Markdown / MDX、脚注、リンクカード、コードのファイル名表示）
- ブログ内検索、RSS、サイトマップ、OGP 画像の自動生成
- プロフィールページと、Qiita / Zenn などの外部フィードを集めた Finds ページ
- 問い合わせフォーム（Cloudflare Turnstile、D1 への保存、Email 通知、レート制限）
- CSS Variables と scoped CSS によるスタイリング、ダークモード対応

## 技術スタック

- [Astro](https://astro.build/) / MDX / TypeScript
- [Cloudflare Workers](https://developers.cloudflare.com/workers/)（D1・Email・Rate Limiting・Turnstile）
- [Vitest](https://vitest.dev/) と Node の test runner によるテスト
- ESLint・Prettier・textlint・knip による静的検査
- [Resvg](https://github.com/yisibl/resvg-js)（OGP 画像生成）

Node と pnpm のバージョンは `mise.toml` と `package.json` の `packageManager` を参照してください。

## プロジェクト構造

```text
/
├── src/
│   ├── actions/     # Astro Actions（問い合わせフォーム）
│   ├── assets/      # 画像などの静的アセット
│   ├── components/  # UI コンポーネント
│   ├── content/     # blog（ja / en）・profile・findsFeed
│   ├── layouts/     # ページレイアウト
│   ├── lib/         # ドメインロジック（blog / contact / markdown / remark / rehype など）
│   ├── pages/       # ルーティング
│   ├── scripts/     # クライアント側スクリプト
│   └── styles/      # グローバルスタイル・CSS Variables
├── scripts/         # OGP 生成・ブログ記事の textlint 実行
├── migrations/      # D1（問い合わせ保存用）のマイグレーション
├── tests/           # Vitest / Node のテスト
└── public/          # 静的ファイル（画像・OGP など）
```

## セットアップ

1. 依存関係をインストールします。

```bash
pnpm install
```

2. 必要に応じて `.env` を作成し、環境変数を設定します（下記）。

3. 開発サーバーを起動します。

```bash
pnpm run dev
```

### 環境変数

| 変数                        | 用途                                                       |
| :-------------------------- | :--------------------------------------------------------- |
| `CONTACT_TO_EMAIL`          | 問い合わせの通知先アドレス                                 |
| `CONTACT_FROM_EMAIL`        | 問い合わせ通知の送信元アドレス                             |
| `TURNSTILE_SECRET_KEY`      | Turnstile のシークレットキー（サーバー側の検証用）         |
| `PUBLIC_TURNSTILE_SITE_KEY` | Turnstile のサイトキー（クライアントに公開）               |
| `QIITA_API_ENDPOINT`        | Qiita API の endpoint（既定は `https://qiita.com/api/v2`） |
| `QIITA_USERNAME`            | Finds ページで取得する Qiita のユーザー名                  |
| `ZENN_API_ENDPOINT`         | Zenn API の endpoint（既定は `https://zenn.dev/api`）      |
| `ZENN_USERNAME`             | Finds ページで取得する Zenn のユーザー名                   |

本番の `CONTACT_TO_EMAIL`・`CONTACT_FROM_EMAIL`・`PUBLIC_TURNSTILE_SITE_KEY` は `wrangler.jsonc` の `vars` で、D1・Email・Rate Limiting の binding も同ファイルで管理しています。シークレットはコミットしないでください。クライアントに公開する値にだけ `PUBLIC_` を付けます。

## コマンド

| コマンド                     | 説明                                   |
| :--------------------------- | :------------------------------------- |
| `pnpm run dev`               | 開発サーバーを起動（`localhost:4321`） |
| `pnpm run build`             | 本番用ビルドを生成（`./dist/`）        |
| `pnpm run preview`           | ビルドしたサイトをプレビュー           |
| `pnpm run generate-ogp`      | OGP 画像を生成                         |
| `pnpm run build:with-ogp`    | OGP 画像を生成してからビルド           |
| `pnpm run build:cloudflare`  | Cloudflare 向けに OGP 付きでビルド     |
| `pnpm run lint`              | ESLint                                 |
| `pnpm run astro check`       | Astro・型・コンテンツの検査            |
| `pnpm run lint:text:blog`    | ブログ記事の textlint                  |
| `pnpm run lint:deps`         | 未使用の依存・ファイルを knip で検査   |
| `pnpm run format:check`      | Prettier の整形確認                    |
| `pnpm run test`              | Node のテストと Vitest を実行          |
| `pnpm run db:migrate:local`  | D1 のマイグレーションをローカルに適用  |
| `pnpm run db:migrate:remote` | D1 のマイグレーションを本番に適用      |

## デプロイ

Cloudflare Workers にデプロイします。Build command は `pnpm run build:cloudflare` です。`wrangler.jsonc` は `./dist/client` を静的アセットとして配信し、問い合わせ関連のパス（`/contact` と `/en/contact`）は Worker を先に実行します。問い合わせページは SSR（`prerender = false`）のままにしてください。

## 記事の追加

記事は `src/content/blog/ja/`（日本語）と `src/content/blog/en/`（英語）に、kebab-case のファイル名で置きます。frontmatter は `src/content.config.ts` の schema に合わせます。`_` で始まるファイルは非公開のドラフトとして Git の管理対象外になります。
