# TODO

- [x]: メタ情報の見直し
- [x]: パンくずの見直し
- [x]: hover挙動をPC時のみに修正
- []: SEO対策の見直し
  - []: タイトルの見直し
  - []: キーワードの見直し
  - []: 画像読み込みの最適化（後回し）
- []: お問い合わせフォームの見直し
  - []: reCAPTCHAの設定見直し
- []: サイト内コンテンツの追加
  - []: ブログ記事作成
  - []: プロフィール情報の充実化
  - []: zenn記事情報の取得
  - []: zennとqiitaにこのプロジェクト内から記事をPOSTできるか調査
    - []: できる場合は実現

## Astro 設定

- [x]: `astro.config.mjs`: `vite.build.cssCodeSplit: false` を見直す。デフォルト(`true`)に戻し、CSSがページごとに分割されるようにすることを検討する（パフォーマンス向上の可能性）。

## 依存関係

- [x]: `package.json`: UnoCSS関連のパッケージ (`unocss`, `@unocss/*`) がBeta版 (`66.1.0-beta.3`) になっている。安定性を重視する場合、最新のstableリリースへの更新を検討する。

## スクリプト (`scripts/`)

- [ ] `update-environment.js`: `tree` コマンドへの依存がある。README等に依存関係として明記するか、Node.js `fs` モジュールでの代替実装を検討する。
- [ ] `update-environment.js`: `generateFileDescriptions` 関数内のファイルリストと説明を手動で更新する必要がある点について、スクリプト内にコメントで注意喚起を追加する。
- [x] `update-environment.js`: `generateFileDescriptions` 関数から不要な `tailwind.config.mjs` の記述を削除する。
- [ ] `update-environment.js`: `generateFileDescriptions` 関数の `スタイル` カテゴリの記述を、現在の構成（例: `src/styles/global.css`, `uno.config.ts`）に合わせて修正する。
- [ ] `environment.md`: 「自動更新の仕組み」の記述を、実際の動作（`predev` で実行される）に合わせて修正する（`update-environment.js` 内で修正が必要）。
- [ ] **[重要]** `build-ogp.js`: 現在の実装は `http://localhost:4321` で開発サーバーが動作していることを前提としている。しかし `package.json` の `build:with-ogp` スクリプトではビルド後に実行されるため、サーバーは起動していない。このため、OGP生成が失敗する可能性が高い。ビルドプロセス内で静的に画像を生成する方式（例: Astroのエンドポイントルートを利用）に変更するか、`preview` サーバーを一時的に利用するなどの対策が必要。
- [ ] `build-ogp.js`: 開発サーバーのURL (`http://localhost:4321`) がハードコードされている。環境変数などで設定可能にすることを検討する。
- [ ] `build-ogp.js`: `/api/og/[path]` APIエンドポイントへの依存があることを明確にする（README等への記載やコード内コメント）。

## OGP生成 (`src/pages/api/og/[...slug].astro`)

- [ ] OGP生成プロセス全体の見直し: `build-ogp.js` がビルド後の静的HTML (`dist/api/og/...`) を読み込むように修正し、開発サーバーへの依存をなくすことを検討する。
- [ ] フォントの整合性: サイト本体で使用しているフォント (`@fontsource/zen-kaku-gothic-new`) がOGP画像にも適用されるように、エンドポイント内でフォント読み込みを追加する。
- [ ] ハードコードされたサイト名 ("SAKUSPACE") を設定ファイル等から読み込むように修正する。

## コンポーネント (`src/components/`)

### ContactForm (`Contact/ContactForm.tsx`)

- [ ] ボタンコンポーネントの共通化: 送信ボタンや「新しいお問い合わせ」ボタンを、サイト共通の汎用的な `Button` コンポーネントとして切り出すことを検討する。
- [ ] バリデーションエラー表示: 各入力フィールドに対応するバリデーションエラーメッセージをUI上に表示する処理を追加する（`ContactFormInput.tsx`, `ContactFormTextarea.tsx` の修正が必要）。
- [ ] Importパスのエイリアス利用: `import` 文で相対パス (`../../`) の代わりに `@/` エイリアスを使用する。
- [ ] [要確認] reCAPTCHAのバックエンド検証: フォームデータを受け取るAPI側でreCAPTCHAトークンの検証が正しく行われているか確認する。
