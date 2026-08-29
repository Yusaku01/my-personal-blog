# Astro Incremental Static Builds 導入素材

最終更新：2026-08-29

この記事素材は、Astro 7.2のIncremental Static Buildsをこのブログへ導入する過程を記録する。

完成原稿ではない。

事実、解釈、主観、未検証事項を分け、後からMDX記事へ編集できる状態を保つ。

## 現在地

- Astroを7.1.3から7.2.7へ更新した。
- Astro 7.2.7が要求する`@astrojs/markdown-remark` 7.2.4と、対応する`@astrojs/mdx` 7.0.8へ更新した。
- `astro check`、通常のWorkers向けbuild、Node test、Vitest、ESLint、Prettierは成功した。
- `experimental.incrementalBuild`を有効にした。
- 最初のcanaryとして、`/blog/[...slug].md`だけにentry digest由来の`cacheKey`を追加した。
- 同一入力の二回目buildで29件すべてが`restored`になり、force buildとのSHA-256比較も一致した。
- 一記事追加時は既存29件をrestoreし、新規1件だけをrenderした。削除後はstale cacheもpruneされた。
- HTML記事routeは関連記事という別entryへの依存があるため、まだ`cacheKey`を追加していない。
- デプロイ先はCloudflare Pagesではない。
- `@astrojs/cloudflare/entrypoints/server`とWorkers Static Assetsを組み合わせ、`/contact`と`/en/contact`だけWorkerを先に通している。
- 現在の`cacheDir`は`.astro-cache`である。
- Workersのビルド環境で`.astro-cache`をビルド間に保存、復元する方法は未確認である。

## 記事の中心に置けそうな問い

- 静的サイトのビルドは、なぜ変更していないページまで毎回生成するのか。
- Incremental Static Buildsは、どの処理を省略し、何を省略しないのか。
- `cacheKey`が同じなら安全に再利用できる、と誰が保証するのか。
- コードの依存グラフとコンテンツの依存関係は、同じ方法で追跡できるのか。
- Next.jsのISRと、AstroのIncremental Static Buildsはどこで実行されるのか。
- フレームワークの差分ビルドと、ホスティングサービスのビルドキャッシュは何が違うのか。
- ビルド時間が短くなっても、キャッシュ転送時間を含むデプロイ全体は短くなるのか。
- 正しいHTMLを再生成したことと、以前のHTMLを安全に再利用したことをどう比較するのか。

## 記事アウトライン案

### 静的ビルドが行うこと

- routeを列挙する。
- MarkdownやMDX、コンテンツデータを読み込む。
- layoutとcomponentを組み合わせてHTMLを生成する。
- CSS、JavaScript、画像などのassetを生成、最適化する。
- 生成物をホスティング環境へ配置する。
- 通常のfull buildでは、前回と同じHTMLになるrouteも再びrenderされる。

### Incremental Static Buildsが省略する処理

- Astro 7.2の実験機能である。
- `getStaticPaths()`が返すrouteのうち、`cacheKey`を持つrouteだけが再利用候補になる。
- 前回と`cacheKey`が一致し、routeが依存するmodule graphのhashも一致すると、前回の出力を`cacheDir`から復元する。
- `getStaticPaths()`を使わない静的routeは毎回renderされる。
- SSR routeは対象ではない。
- Astroの設定または依存パッケージが変わると、全cacheが無効になる。
- `astro build --force`はcacheを無視して全routeをrenderし、次回用のcacheを作り直す。

### Next.js ISRとの比較

- 比較軸は「staticかdynamicか」だけにしない。
- 生成が起きる時点を分ける。
  - Astro Incremental Static Builds：デプロイ前のbuild時に、前回出力を再利用する。
  - Next.js ISR：デプロイ後も、時間または明示的なrevalidationを契機にpageを再生成できる。
- Astroの機能は公開後の鮮度制御ではなく、同じdeployment artifactを作るためのbuild省略である。
- Astroのcacheを失っても正しさは変わらず、buildが遅くなる。
- ISRのcacheとrevalidationは、公開中のresponseがいつ更新されるかに関わる。

### ホスティングサービスのincremental buildとの比較

- 依存パッケージのdownload cache、framework cache、以前のbuild outputの再利用を分ける。
- ホスティング側がdirectoryを保存しても、frameworkがpage単位の再利用条件を理解するとは限らない。
- Astroは`cacheKey`とmodule graph hashでpage再利用を判断する。
- ホスティング環境は、その判断材料を格納した`cacheDir`を次のbuildへ運ぶ役割を担う。
- 「cacheがある」と「該当pageを再renderしなくてよい」は別の命題である。

### cacheとcache破棄

- cache hitの条件を式として整理する。

```text
reuse(page) =
  previousOutputExists
  && previousCacheKey === currentCacheKey
  && previousModuleGraphHash === currentModuleGraphHash
```

- `cacheKey`はpageのHTMLへ影響するデータ全体を代表する必要がある。
- keyを細かくすると再利用率は上がるが、依存の見落としによるstale HTMLの危険が増える。
- keyを広くすると安全側になるが、無関係な変更でもcache missになり、効果が減る。
- cacheの正しさとcache hit率はトレードオフになる。

### このブログへ導入する過程

1. Astro 7.2系へ上げ、Incremental Static Buildsを無効にしたまま通常buildを通す。
2. full buildの時間と成果物をbaselineとして保存する。
3. Workersのビルド環境で`.astro-cache`を保存、復元できるか確認する。
4. Markdown endpointをcanaryにし、entry digest由来の`cacheKey`を追加する。完了。
5. 同一commitを二回buildし、二回目で29 routeがrestoreされることを確認する。完了。
6. `--force` buildとincremental buildのMarkdown成果物をSHA-256で比較する。完了。
7. 一記事を追加し、既存29件のrestoreと新規1件のrenderを確認する。完了。
8. HTML記事routeについて、記事本体と関連記事を同じpropsと`cacheKey`へ反映する。
9. 英語fallback routeへ対象を広げる。
10. cacheの保存、復元時間を含むdeployment全体を計測する。

### このブログ固有の難しさ

#### 関連記事が暗黙のデータ依存になる

記事詳細pageは、現在の記事だけでなく、同じtagを持つ記事全体から関連記事を選ぶ。

新しい記事を一件追加すると、編集していない既存記事の関連記事欄が変わる場合がある。

`cacheKey: String(post.digest)`だけでは、この変化を表現できない。

候補は次の三案である。

- **記事digestだけを使う**：hit率は高いが、関連記事が古くなる危険がある。
- **collection全体のdigestを含める**：安全側だが、一記事の変更で全記事がmissになる。
- **render結果へ影響する関連記事のIDとdigestを含める**：hit率と正しさを両立しやすいが、key生成とpage生成で同じ選択ロジックを共有する設計が必要になる。

#### 英語routeが日本語記事へfallbackする

英語記事が存在しないslugでは、日本語entryを英語routeにもrenderする。

日本語entryの変更が、日本語page、英語fallback page、Markdown endpointへ波及する。

route単位だけを見ていると、この多重生成を見落としやすい。

#### profileなどの共有コンテンツがlayoutへ入る

module graph hashはcomponent codeの変更を追跡する。

しかし、componentが読み込むcontent entryの値まで、page固有の`cacheKey`が自動的に代表するとは限らない。

profile、navigation、footerなどの共有データを変更したとき、どのpageを無効化するかを決める必要がある。

#### OGP生成は別工程である

本番用scriptはAstro buildの前にOGP画像を全件生成する。

Incremental Static Buildsが短縮するのはAstroのpage renderingであり、既存のOGP全件生成は省略しない。

Astro buildだけを計測すると、deployment全体の改善を過大評価する可能性がある。

#### 外部API取得は別の鮮度問題を持つ

QiitaとZennの情報をbuild時に取得している。

外部データの更新時刻を`cacheKey`に含めないrouteでは、page再利用と外部データの鮮度が一致しない可能性がある。

API取得時間、失敗時fallback、page cacheを別々に計測する。

### 実験機能として確認する項目

- `build.concurrency > 1`ではincremental cacheが無効になる。
- middlewareによるprerendered HTMLの変更は、自動的なcache invalidationの対象外である。
- server islandを含むpageは、安定した`ASTRO_KEY`がないと毎回renderされる。
- patch releaseでも仕様が変わる可能性がある。
- 安定版へ昇格する時期は、公式に確約された日程と、議論上の期待を分けて書く。

### 導入後に欲しくなりそうな機能

以下は現時点の要望候補であり、Astroのroadmapで提供が確定した機能ではない。

- あるrouteがcache hitまたはmissになった理由を機械可読な形式で出力する機能。
- `cacheKey`に含まれていないcontent dependencyを検出する診断機能。
- cache hit率、再利用したbyte数、復元時間をsummaryとして出す機能。
- full buildとincremental buildのartifact parityを検査する公式command。
- middleware変更時に、影響するprerendered routeを明示する仕組み。
- build provider別のcache保存例。
- routeごとのcache sizeと転送costを確認する機能。

### 相性がよい場面

- `getStaticPaths()`で大量のpageを生成する。
- 一回の変更で更新されるpageが全体の一部に限られる。
- MDX変換、syntax highlight、diagram生成、画像処理など、page renderingが重い。
- build間で`cacheDir`を確実に保存、復元できる。
- pageの入力データに安定したdigestまたは更新versionがある。

### 効果が小さくなりやすい場面

- page数が少ない。
- 共通layoutやdependencyが頻繁に変わり、毎回広い範囲が無効になる。
- `getStaticPaths()`を使わないpageがbuild時間の大半を占める。
- OGP、外部API、asset処理など、対象外の工程が支配的である。
- cache archiveの保存、復元時間がrender省略時間を上回る。

## 今回すでに得た実体験

### デプロイ方式を先に確定する必要があった

当初、Cloudflare Pagesのbuild cacheを前提に評価してしまった。

実装を確認すると、実際はCloudflare Workers Static AssetsとWorker entrypointの構成だった。

同じCloudflareでも、cacheを誰がどこへ保存するかは異なる。

記事では「ホスティングサービス名だけでcache戦略を決めない」という注意点に使える。

### 最新versionよりリポジトリの供給網ポリシーを優先した

Astro 7.2.9は利用可能だったが、公開から72時間を経過していなかった。

リポジトリの`minimum-release-age=4320`がinstallを拒否したため、例外を追加せず7.2.7を選んだ。

Incremental Static Buildsを使うためのversion更新で、別の安全策を弱めない判断をした。

### Astro単体のversion番号だけでは互換性を判断できなかった

Astro 7.2.7へ更新すると、`@astrojs/markdown-remark`のpeer dependency不一致が表示された。

Markdown Remarkだけでなく、それを固定依存として含むMDX integrationも対応versionへ揃えた。

「Astroを上げる作業」と「Incremental Static Buildsを有効にする作業」を分けたことで、問題の原因を切り分けられた。

### local installの状態がlockfileとずれていた

最初のbuildは、`package.json`に宣言済みのpackageを`node_modules`から解決できずに失敗した。

これはAstro 7.2の互換性問題ではなく、以前のinstall状態が古かったことによる。

同じエラーでも、機能の不具合、依存関係の不整合、実行環境の制約を分けて記録する必要がある。

### sandboxの失敗を製品の失敗として扱わなかった

Wranglerのlog directoryへの書き込みと、test用HTTP serverのlistenがsandboxで拒否された。

許可された環境で再実行するとtestは成功した。

再現記事では、エラーが起きた層を明記しないと、Astroやtest codeの問題に見えてしまう。

### dev serverの実行モデルが変わって見えた

依存を同期する前のlocal `node_modules`はAstro 6.1.1だった。

Astro 7.2.7では、CodexのようなAI agent環境を検出すると、`astro dev`を自動的にbackground processとして起動する。

最初のcold startはreadyになる前に終了したが、verbose logで再実行すると起動し、その後の通常commandも成功した。

`astro dev status`、`astro dev logs`、`astro dev stop`と`/_astro/status`が診断手段になる。

これはproject APIの非推奨化ではなく、dev serverのprocess管理方法が変わったことで表面化した挙動だった。

### 小さなMarkdown endpointを最初のcanaryにした

HTML記事pageは、記事本体だけでなく、同じtagを持つ別記事から選ぶ関連記事にも依存する。

最初からHTMLへ`post.digest`だけを設定すると、関連記事が変わったpageを誤って再利用する可能性があった。

そこで、出力が記事本文だけで決まる`/blog/[...slug].md`を最初の対象にした。

同じ入力で二回buildすると29件すべてが`restored`になり、force buildとのSHA-256も一致した。

一時的な記事を一件追加すると、既存29件はrestoreされ、新規routeだけがrenderされた。記事を削除した次のbuildでは、Astroがstale fileを一件pruneした。

この結果は差分再利用の正しさを示すが、全体build時間の大幅な改善はまだ示していない。

Markdown endpointは一件1〜2msであり、現状のbuild時間はserver bundle、外部feed、OGP、その他の静的routeが支配している。

詳細は[`canary-results.md`](./canary-results.md)へ保存した。

## 作業者として感じたこと

- feature flagを一行追加する作業より、「どのデータがHTMLへ影響するか」を列挙する作業のほうが難しい。
- module importはコード上に現れるが、関連記事のようなデータ依存は関数の振る舞いを読まないと見つからない。
- cache hitを増やす設計には気持ちよさがある一方、keyを細くしすぎると、速いまま古いHTMLを配る危険がある。
- `--force`というfull buildへの退避経路があるため、実験機能を小さく試しやすい。
- build時間だけを短く見せる計測は簡単だが、cacheの保存と復元、OGP生成、deployまで含めると評価は難しくなる。
- このブログは記事page数とMDX処理があるため題材として扱いやすいが、現在の規模では劇的な短縮を前提にしないほうがよい。
- 成功ログだけでは記事が平板になる。誤ったPages前提、release age拒否、peer dependency、stale install、sandbox制約は、設計判断を説明する材料になる。

## 証拠の扱い

- **確認済み**：repository、command output、公式documentationから確認した内容。
- **解釈**：確認済みの事実から導いた意味。別の説明が成立しないか確認する。
- **主観**：作業中に難しい、安心できる、危険だと感じた点。
- **未検証**：今後の実験で確認する仮説。

## 関連素材

- [`logs/2026-08-29-astro-7.2-upgrade.log`](./logs/2026-08-29-astro-7.2-upgrade.log)：今回発生したエラー原文と抽象化した意味。
- [`measurements.csv`](./measurements.csv)：cold、warm、一記事変更、force buildの計測表。
- [`canary-results.md`](./canary-results.md)：Markdown endpoint canaryの導入、cache hit、成果物比較、削除時pruneの記録。
- [`repository-inventory.md`](./repository-inventory.md)：87個の対象route、共有データ依存、OGP、Mermaid、外部APIの棚卸し。
- [`research-notes.md`](./research-notes.md)：Next.js、Gatsby、Netlify、Vercel、Cloudflareとの比較とroadmap調査。
- [`screenshots/README.md`](./screenshots/README.md)：撮影対象、ファイル名、撮影条件。

## 公式資料

- [Astro Experimental incremental static builds](https://docs.astro.build/en/reference/experimental-flags/incremental-build/)
- [Astro configuration reference](https://docs.astro.build/en/reference/configuration-reference/)
- [Astro Cloudflare adapter](https://docs.astro.build/en/guides/integrations-guide/cloudflare/)
- [Cloudflare Workers Static Assets](https://developers.cloudflare.com/workers/static-assets/)
- [Next.js Incremental Static Regeneration](https://nextjs.org/docs/app/guides/incremental-static-regeneration)

## 追記ルール

- commandを実行した時刻、commit、cache状態、変更scenarioを記録する。
- errorは省略した説明だけでなく、検索可能な原文も残す。
- screenshotは成功または失敗の判定材料が画面内に収まるように撮る。
- secret、email address、token、localの個人情報を公開用画像へ含めない。
- Computer Historyが対象画面を記録していない場合、別画面の画像を証拠として流用しない。
- 実験結果を記事へ移すとき、当時のversionと日付を残す。
