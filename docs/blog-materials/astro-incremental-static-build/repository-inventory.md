# このブログのIncremental Static Builds対象

確認日：2026-08-29

## 実装構成

| 項目               | 現在の状態                               | 出典                     |
| ------------------ | ---------------------------------------- | ------------------------ |
| Astro              | 7.2.7                                    | `package.json`           |
| output             | `server`                                 | `astro.config.mjs`       |
| adapter            | `@astrojs/cloudflare`                    | `astro.config.mjs`       |
| cacheDir           | `./.astro-cache`                         | `astro.config.mjs`       |
| Worker entrypoint  | `@astrojs/cloudflare/entrypoints/server` | `wrangler.jsonc`         |
| Static Assets      | `./dist/client`                          | `wrangler.jsonc`         |
| Worker-first route | `/contact`と`/en/contact`                | `wrangler.jsonc`         |
| Incremental Build  | 未設定                                   | repository全体の検索結果 |
| cacheKey           | 未設定                                   | repository全体の検索結果 |

`AGENTS.md`にはAstro 6、static output、Cloudflare Pagesという説明が残っている。

現在の実装はAstro 7.2、server output、Cloudflare Workers Static Assetsである。

導入記事では、guideや過去の認識より実装を優先してデプロイ経路を確定した過程も素材になる。

## getStaticPathsを使うroute

| route                 | production時のpath数 | 入力                             |
| --------------------- | -------------------: | -------------------------------- |
| `/blog/[...slug]/`    |                   29 | 日本語公開記事                   |
| `/en/blog/[...slug]/` |                   29 | 英語記事4件、日本語fallback 25件 |
| `/blog/[...slug].md`  |                   29 | 日本語公開記事本文               |
| 合計                  |                   87 | 3種類の出力                      |

ファイル上の日本語記事は32件だが、ファイル名が`_`で始まるdraft 3件をproduction buildでは除外する。

単純なファイル数ではなく、production条件を通過したpath数を数える必要がある。

出典：

- `src/pages/blog/[...slug].astro:20`
- `src/pages/en/blog/[...slug].astro:21`
- `src/pages/blog/[...slug].md.ts:36`
- `src/lib/blog/posts.ts:29`
- `src/lib/blog/posts.ts:32`

## 固定routeのprerender

Contact以外のpageは、ほぼすべて`prerender = true`である。

ただし、Incremental Static Buildsがskipできるのは、`getStaticPaths()`が返して`cacheKey`を持つpageである。

Home、一覧、検索index、RSS、profile、finds、404はprerenderされるが、現行仕様では毎回renderされる。

| page群                                        | build時の主な入力                            |
| --------------------------------------------- | -------------------------------------------- |
| `/`、`/en/`                                   | local記事、Qiita、Zenn Articles、Zenn Scraps |
| `/blog/`、`/en/blog/`                         | 全投稿、画像、一覧UI                         |
| `/blog/personal/`                             | personal投稿                                 |
| `/blog/qiita/`                                | Qiita投稿                                    |
| `/blog/zenn/`                                 | Zenn ArticlesとScraps                        |
| `/finds/`、`/en/finds/`                       | findsFeed collection                         |
| `/profile/`                                   | profile content entry                        |
| `/search-index.json`、`/en/search-index.json` | localと外部投稿の検索index                   |
| `/rss.xml`                                    | 日本語記事                                   |
| `/404.html`                                   | 固定page                                     |

## article pageのcacheKey候補

| HTMLへ影響する入力 | 変化の例                              | 個別記事digestだけで追跡できるか     |
| ------------------ | ------------------------------------- | ------------------------------------ |
| 現在の記事         | 本文、title、description、tag、image  | できる                               |
| 関連記事           | 別記事のtag、日付、title、slug、image | できない                             |
| locale fallback    | 英語訳の追加または削除                | できない                             |
| profile            | social linkなど共有contentの変更      | できない可能性がある                 |
| i18n data          | labelやnavigationの変更               | module graphで追跡できる             |
| layoutとcomponent  | markupやstyleの変更                   | module graphで追跡できる             |
| remote link card   | link先のOGP変更                       | 個別記事digestは変わらない           |
| build environment  | Mermaid rendering strategyの変更      | environmentをkeyへ含めない限り不明確 |

### 関連記事

`getRelatedBlogPosts()`は、現在の記事とtagが一致する記事をcollection全体から探す。

一致tag数を優先し、同数なら公開日の新しい記事を優先して二件を表示する。

したがって、新記事を追加しただけで、既存記事の関連記事欄が変わる場合がある。

出典：`src/lib/blog/posts.ts:118-160`

### locale fallback

英語routeは、同じslugの英語entryがなければ日本語entryを使用する。

英語訳を追加すると、英語routeの入力entryが日本語から英語へ切り替わる。

出典：`src/lib/blog/posts.ts:32-61`

### remote link card

MDX内のURLからOpen Graph情報を取得してlink card HTMLを生成する。

source MDXが変わらなくても、link先のOGPは変わり得る。

「再現可能なstatic build」と「外部情報を最新化するbuild」をどちらに寄せるか、cache TTLまたは明示的なrefresh手段が必要になる。

出典：`src/lib/remark/remarkLinkCard.ts:114-215`

## Incremental Buildの外側にある工程

### OGP画像

`build:with-ogp`は、Astro buildの前にOGP画像を生成する。

固定page 8件と公開記事33件を合わせ、41 targetを順番にPNGへ書き出す。

既存scriptは各targetを毎回処理するため、Astroがarticle HTMLを再利用してもOGP生成は残る。

出典：

- `package.json:28-30`
- `scripts/lib/build-ogp-core.js:38-62`
- `scripts/lib/build-ogp-core.js:292-337`
- `scripts/lib/build-ogp-core.js:351-397`

### Mermaid

Markdown pipelineは`rehype-mermaid`を使用する。

Cloudflare向けbuildでは`ASTRO_MERMAID_STRATEGY=pre-mermaid`を設定する。

Mermaid code fenceは現在3記事、6箇所にある。

Incremental Buildでpage renderをskipすると、この変換もskipできる可能性があるため、重いMDX処理の実例として個別に時間を測る。

出典：

- `src/lib/markdown/mermaidConfig.ts:1-31`
- `package.json:30`

### 外部API

Home、一覧、検索indexはQiita、Zenn Articles、Zenn Scrapsをbuild時に取得する。

process内に一時間cacheがあるが、別buildへ永続化するdisk cacheではない。

固定routeはIncremental Static Buildsのskip対象ではないため、外部API取得が残る可能性が高い。

出典：

- `src/lib/blog/posts.ts:63-116`
- `src/lib/api-clients/qiita.ts:51-110`
- `src/lib/api-clients/zenn.ts:63-195`

## baseline

Astro 7.2.7へ更新し、Incremental Static Buildsを無効にした状態の結果である。

| 確認               | 結果                                     |
| ------------------ | ---------------------------------------- |
| `astro check`      | 103 files、0 errors、0 warnings、0 hints |
| `pnpm run build`   | 成功                                     |
| Astro server build | 17.63秒                                  |
| prerender          | 2.86秒                                   |
| Node test          | 17件成功                                 |
| Vitest             | 12 files、60件成功                       |
| ESLint             | 成功                                     |
| Prettier check     | 成功                                     |
| `git diff --check` | 成功                                     |

Viteは500kBを超えるchunkを警告した。

build成功とclient performanceは別の評価であり、この警告はIncremental Static Buildsの効果として扱わない。

## 未確認

- 実際のdeployment buildを実行しているのがWorkers Buildsか、外部CIか。
- `.astro-cache`をbuild間で保存、復元する設定。
- 同一入力の二回目buildでskipされるroute数。
- 一記事変更時に再renderされるrouteの範囲。
- cache archiveのsize、保存時間、復元時間。
- `--force`とincremental outputのSHA-256一致。
- OGPを含む本番command全体の短縮率。
- Cloudflareへのuploadとdeploymentを含む公開時間の短縮率。
