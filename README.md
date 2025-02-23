# Personal Blog & Portfolio Website

このプロジェクトは、Astroを使用して構築された個人ブログ＆ポートフォリオウェブサイトです。

## 🌟 特徴

- ブログ機能（Markdown対応）
- プロフィールページ
- コンタクトフォーム
- レスポンシブデザイン
- Tailwind CSSによるスタイリング
- TypeScriptサポート

## 🚀 技術スタック

- [Astro](https://astro.build/) - 静的サイトジェネレーター
- [TypeScript](https://www.typescriptlang.org/) - 型安全な開発
- [Tailwind CSS](https://tailwindcss.com/) - スタイリング
- [date-fns](https://date-fns.org/) - 日付操作
- React（一部コンポーネント）

## 📦 プロジェクト構造

主要なディレクトリとその役割：

```text
/
├── src/
│   ├── assets/      # 画像などの静的アセット
│   ├── components/  # 再利用可能なコンポーネント
│   ├── content/     # ブログ記事のMarkdownファイル
│   ├── layouts/     # ページレイアウト
│   ├── lib/        # ユーティリティ関数とAPI
│   ├── pages/      # ルーティング用ページコンポーネント
│   ├── styles/     # グローバルスタイルとCSS
│   └── types/      # TypeScript型定義
└── public/         # 静的ファイル
```

## 🛠️ セットアップ

1. リポジトリをクローン：
```bash
git clone [repository-url]
```

2. 依存関係をインストール：
```bash
npm install
```

3. 開発サーバーを起動：
```bash
npm run dev
```

## 📝 コマンド

| コマンド                   | 説明                                           |
| :------------------------ | :----------------------------------------------- |
| `npm install`             | 依存関係をインストール                            |
| `npm run dev`             | 開発サーバーを起動（`localhost:4321`）           |
| `npm run build`           | 本番用ビルドを生成（`./dist/`）                  |
| `npm run preview`         | ビルドしたサイトをプレビュー                      |

## 🔄 自動更新

環境構成の詳細は `environment.md` に記載されており、プロジェクトの構造が変更されると自動的に更新されます。

## 📄 ライセンス

このプロジェクトはMITライセンスの下で公開されています。
