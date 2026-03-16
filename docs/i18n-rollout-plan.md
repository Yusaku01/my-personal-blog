# i18n（日本語 + 英語）段階導入プラン

このドキュメントは、**既存の日本語運用を壊さずに英語版を追加**するための、Astro公式 i18n 機能ベースの段階導入案です。

## 目的と前提

- 目的: ブログ記事コンテンツ（`src/content/blog`）は当面日本語中心のまま維持しつつ、**それ以外の画面/導線を ja/en で提供**する。
- 前提: 現状はルート配下に日本語ページが直接配置されており、`Layout` の `lang` / OGP locale / RSS などが日本語前提になっている。

## 現状から見える i18n 導入時の論点

1. **ページ構成が単一ロケール前提**
   - ルーティングは `src/pages/index.astro`, `src/pages/finds.astro`, `src/pages/profile.astro`, `src/pages/blog/*` の単一構成。
2. **レイアウトが日本語固定**
   - `src/layouts/Layout.astro` で `<html lang="ja">` および `<meta property="og:locale" content="ja_JP" />` が固定。
3. **データ取得が言語非対応**
   - `src/content.config.ts` の `blog` / `findsFeed` / `profile` はロケール軸を持たない単一 collection。
   - `src/lib/blog/posts.ts` で URL を `/blog/${post.id}` と固定。
4. **派生エンドポイントが単一**
   - `src/pages/rss.xml.ts` は `<language>ja</language>` 固定。
   - `src/pages/search-index.json.ts` は単一 index を返す。
5. **ナビゲーションの文言とURL切替機構がない**
   - ヘッダー/フッターで locale ごとの遷移、`hreflang`、言語スイッチ導線を未実装。

## 段階導入ロードマップ

### Phase 0: 設計を先に固定する（実装前）

- ロケール方針
  - `ja`（既定）と `en`（追加）。
  - URL戦略は次のどちらかを先に決める。
    - A. 日本語は既存 `/` を維持、英語のみ `/en/*`。
    - B. 両言語とも `/ja/*`, `/en/*` に寄せる（将来拡張向けだが移行コスト高）。
- 初期スコープ
  - 「非ブログ記事ページ」= `index` / `finds` / `profile` / 共通UI（Header/Footer/Breadcrumb/SEO）。
  - ブログ本文（MDX本文）は日本語のみ維持。英語側は一覧・導線のみ提供、記事詳細は当面日本語へフォールバック。
- 受け入れ条件（DoD）
  - 日本語URLが既存どおり動く。
  - 英語URLで主要ページが表示可能。
  - locale 切替時に canonical / alternate / og:locale が矛盾しない。

### Phase 1: Astro i18n の土台導入

- `astro.config.mjs` に i18n 設定を追加
  - `defaultLocale: 'ja'`
  - `locales: ['ja', 'en']`（または map 形式）
  - `routing` 方針（`prefixDefaultLocale` を含む）を Phase 0 のURL戦略に合わせる。
- `@astrojs/sitemap` の `i18n.locales` を `ja` のみから `en` まで拡張。
- 404 / リダイレクト方針を決める
  - 例: `/en` 未対応ページは `/en` トップへ戻す、または `/` へ戻す。

### Phase 2: レイアウトと共通コンポーネントの locale 対応

- `Layout.astro` を locale 受け取り可能にする
  - `<html lang>` を動的化。
  - `og:locale` を `ja_JP` / `en_US` で切替。
  - `alternate hreflang` を locale ごとに出し分け。
- Header/Footer/Breadcrumb を辞書ベースに置換
  - `src/lib/i18n/messages.ts` のような辞書を用意（ja/en）。
  - URL生成は Astro の i18n helper（`getRelativeLocaleUrl` など）利用を基本にしてハードコードを減らす。
- 言語スイッチャーを最小実装
  - 「現在ページの対応 locale へ移動」できるUI。
  - 対応ページがない場合のフォールバック先（例: localeトップ）を固定。

### Phase 3: ページを段階的に locale ルートへ移行

- まず静的ページを移行
  - `index` / `finds` / `profile` から着手。
  - 実装パターンは「共通コンポーネント + locale別エントリページ」または「共通ページ + locale判定」。
- ブログ周辺は2段階で対応
  1. 一覧ページ・カテゴリページ（`/blog`, `/blog/personal`, `/blog/qiita`, `/blog/zenn`）を locale 対応。
  2. 記事詳細は当面 ja コンテンツのみを利用し、en 側は「日本語記事である旨」を明示して同一記事を表示 or ja URL へ誘導。

### Phase 4: コンテンツ層の locale 対応（必要になった時点で）

- `content collections` を locale-aware に再設計
  - 例: `src/content/blog/ja/*` と `src/content/blog/en/*`。
  - schema に `locale`, `slug`, `translationKey` の導入を検討。
- `getCollection('blog')` 利用箇所を locale フィルタ付きに更新。
- 訳の対応づけ
  - `translationKey` で ja/en 記事を紐づけ、言語切替時に同一記事へ遷移可能にする。

### Phase 5: フィード/検索/SEO の locale 分離

- RSS
  - `rss.xml.ts` を locale 別に分離（例: `/ja/rss.xml`, `/en/rss.xml`）。
  - `<language>` と `link` を locale ごとに生成。
- Search index
  - `search-index.json` を locale 別に生成（例: `/ja/search-index.json`, `/en/search-index.json`）。
  - 検索UIは現在 locale の index のみ読む。
- SEO
  - canonical / alternate / sitemap / og:locale / title/description の locale 整合を監査。

### Phase 6: 検証とリリース

- 必須チェック
  - `pnpm run lint`
  - `pnpm run astro check`
  - `pnpm run test`
  - `pnpm run build` と `pnpm run preview` で locale 遷移を目視確認。
- 目視観点
  - 主要導線（Home→Blog→Profile）の言語切替。
  - パンくず、内部リンク、RSSリンク、検索の locale 一貫性。
  - OGP/Crawler 向けメタ（canonical, alternate, og:locale）。

## 実装時の推奨タスク分割（PR粒度）

1. **PR1: i18n基盤のみ**
   - astro config / sitemap / layoutの lang・meta 動的化（UI文言はまだ据え置き）。
2. **PR2: 共通UI辞書化 + 言語スイッチャー**
   - Header/Footer/Breadcrumb とナビ導線。
3. **PR3: 非ブログページの en 対応**
   - index/finds/profile を en 化。
4. **PR4: ブログ一覧・検索・RSS の locale 分離**
   - 記事本文の翻訳は含めない。
5. **PR5（任意）: 記事本文の翻訳導入**
   - content collection の locale 再設計と運用ルール整備。

## 運用ルール（先に決めておくと事故が減る）

- 文言の追加は必ず ja/en 同時追加（辞書にキー欠けを作らない）。
- 片言語のみ存在するページは、もう片方での見せ方（非表示/フォールバック）を明示。
- OGP画像命名や生成ルール（`scripts/build-ogp.js`）に locale suffix が必要かを決めてから実装する。
- 段階導入中は「URLをなるべく変えない」ことを優先し、変更時は 301 戦略を同時に設計する。
